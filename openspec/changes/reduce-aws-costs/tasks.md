> Sequencing (design.md D5): cost safety net first → reversible wins → RDS migration → bastion last.
> Every `terraform apply` below is preceded by a reviewed `terraform plan` that is scanned for
> any unexpected `destroy` (design.md D6). `▸ GATE` lines are go/no-go checkpoints — do not
> proceed past a gate until its condition is met.

## 0. Drift reconciliation (pre-flight — makes all later applies predictable)

> Discovered during the first plan (design.md D8): untargeted applies would reset both ECS
> services to `:latest` and replace the bastion via a newer Ubuntu AMI. Reconcile so plans
> show only intended changes — the precondition for the D6 plan-review gate to mean anything.

- [x] 0.1 Pin deployed image tags (`frontend_image_tag=20251229211721-407fd222`, `backend_image_tag=20251229211723-407fd222`) in `terraform.tfvars` so local applies don't revert services to `:latest`. CI still overrides via `-var`.
- [x] 0.2 Add `lifecycle { ignore_changes = [ami] }` to `aws_instance.bastion` (`bastion.tf`) so a new Ubuntu AMI can't force a replacement mid-migration.
- [x] 0.3 Verify `terraform plan` shows only intended changes — 3 cost adds + bastion SG IP update, **0 destroy**. (The SG update aligns the SSH allow-list to the current IP, needed for migration access.)

## 1. Cost safety net (do first — additive, zero risk)

- [x] 1.1 Add `aws_budgets_budget` (monthly, $130 limit) with alert thresholds at 80/100/120% (ACTUAL) + 100% (FORECASTED) emailing `jake@f-m.fm`. → `iac/application/cost_management.tf`
- [x] 1.2 Add Cost Anomaly Detection: `aws_ce_anomaly_monitor` (service monitor) + `aws_ce_anomaly_subscription` ($10 impact threshold) emailing the same address. → `iac/application/cost_management.tf`
- [x] 1.3 `terraform apply` — 3 added (budget, anomaly monitor + subscription), 1 changed (bastion SG → current IP), 0 destroyed. Budget + anomaly detection live.
- [x] ▸ GATE: budget + anomaly alerts confirmed active before making any cost-affecting change. ✓ (budget visible in console; SNS subscription confirmed)

## 2. Reversible right-sizing wins (bank ~$50/mo; each independently revertible)

- [x] 2.1 Fargate: set `frontend-service` and `backend-service` `desired_count` 2 → 1; applied (0 add, 2 change, 0 destroy). Verified: both services 1/1 running, 0 pending, ALB targets healthy.
- [x] 2.2 VPC endpoints: reduced `ecr_dkr`, `ecr_api`, `logs` `subnet_ids` to a single private subnet; applied (0 add, 3 change, 0 destroy). Verified: forced backend redeploy pulled its image + reached steady state via the single-AZ endpoints.
- [x] 2.3 WAF: removed `waf.tf` (WebACL, regex set, association, logging, log group); applied (0 add, 0 change, 5 destroy). Verified: apex 302, www 301, http→https 301 — serving normally.
- [ ] 2.4 Confirm the three changes above show the expected cost drop over the next billing day (Cost Explorer / budget).
- [ ] ↩ ROLLBACK (any of 2.x): `git revert` the change + `terraform apply`. No data involved.

## 3. RDS consolidation — Phase 0: pre-flight (additive, zero risk)

- [x] 3.1 Took **manual snapshots** of all five instances: `pre-consolidation-<db>-20260724`. *(Recovery point #1.)*
- [x] 3.2 Baseline row counts captured + compared by the migration script (per-table source-vs-target).
- [x] ▸ GATE: all five manual snapshots report status `available`. ✓

## 4. RDS consolidation — Phase 1: provision target (additive, zero risk)

- [x] 4.1 Add a new `aws_db_instance` `consolidated` (`db.t3.small`, postgres 15, gp2 20 GB, `deletion_protection = true`, `skip_final_snapshot = false`, backups + Performance Insights matching current); apply. Old five untouched.
- [x] 4.2 Created the five databases (`authn`, `authz`, `genres`, `user_settings`, `media`) on the new instance under a single `dbadmin` master (design.md D7); credentials in `consolidated-db-credentials` (Secrets Manager).
- [x] ▸ GATE: new instance reachable from the bastion; five empty databases verified. ✓

## 5. RDS consolidation — Phase 2: trial migration (source stays authoritative)

- [x] 5.1 From the bastion, `pg_dump`+restore each of the five databases into the consolidated instance (`migrate_dbs.sh`, via `.pgpass`). No cutover; sources read-only.
- [x] 5.2 Integrity check: per-table row counts compared source-vs-target for all five databases.
- [x] ▸ GATE: integrity passed for all five (authn 5, authz 6, genres 9, user_settings 2, media 9 tables — all MATCH). ✓

## 6. RDS consolidation — Phase 3: cutover (short downtime window)

- [x] 6.1 Cutover run as a single gated command (each step gates the next).
- [x] 6.2 Scaled `backend-service` → 0, drained (writes stopped).
- [~] 6.3 SKIPPED pre-cutover consolidated snapshot — it held only disposable trial data; the untouched old five + Phase-0 snapshots are the real rollback. (Kept downtime short.)
- [x] 6.4 Final delta `pg_dump`/restore with writes quiesced; re-ran integrity — all five MATCH.
- [x] 6.5 Updated all five `*_DATABASE_URL`s → `aws_db_instance.consolidated`; applied (task def `backend:120`).
- [x] 6.6 Backend → 1, reached steady state. Verified: `/genres` HTTP 200; live backend connection pools to all five DBs on consolidated; CPU ~6%, ~1.08 GB free of 2 GB. Downtime ~2–3 min.
- [x] ▸ GATE: cutover verified on the consolidated instance. ✓
- [ ] ↩ ROLLBACK (still available through soak): revert `*_DATABASE_URL`s + `terraform apply`, scale backend up. Old instances untouched.

## 7. RDS consolidation — Phase 4: soak (old instances retained & powered on)

- [x] 7.1 Soak complete (2026-07-24 → 2026-08-01, 8 days — well past the 3-day target). All three CloudWatch alarms stayed OK the entire window; zero alarm firings. Metrics: CPU daily max 7–29%, FreeableMemory min ~1.0 GB of 2 GB (4× above the 256 MB threshold), FreeStorageSpace steady ~18.3 GB. No resize needed.
- [x] 7.2 Old five instances left running + unmodified (rollback net). Confirmed idle (0 connections) post-cutover.
- [x] ▸ GATE: soak completed with no alarms/issues. ✓ (verified 2026-08-01: alarm history clean, old five had 0.0 max connections for the whole window)

## 8. RDS consolidation — Phase 5: decommission (deliberate two-step)

- [x] 8.1 Set `deletion_protection = false` on the five old instances; applied 2026-08-01 (0 add, 5 change, 0 destroy — protection flag only).
- [x] 8.2 Removed the five old `aws_db_instance` blocks + old secrets (`postgresdb-credentials`, `media-db-credentials`, 30-day recovery window) + 5 `random_password`s; repointed `SecretsManagerAccess` policy to `consolidated-db-credentials`. Applied (0 add, 1 change, 14 destroy). Final snapshots taken automatically. *(Recovery point #2.)*
- [x] ▸ GATE: five final snapshots `available` (created 2026-08-01T11:32Z); only `consolidated` remains; site 200 with live connections. ✓

## 9. Bastion removal (LAST — migration no longer needs it)

- [x] 9.1 Replacement access path: **break-glass bastion** (chosen over SSM/ECS Exec — both need interface endpoints that cost more than the bastion, since the private subnets have no NAT). `bastion.tf` resources are now conditional on `enable_bastion` (default `false`); the mechanism is the same bastion proven throughout the migration. Procedure documented in `iac/application/BASTION.md`. Scrubbed `~/.pgpass`, psql history, and migration dumps off the bastion before teardown.
- [x] 9.2 Applied 2026-08-01: instance, key pair, and SG destroyed; bastion ingress removed from the postgres SG. (Note: Terraform ordered the SG delete before the postgres-SG update and hit `DependencyViolation` twice; resolved by revoking the ingress rule via CLI, then a clean converging apply.)
- [x] 9.3 Verified: 0 EC2 instances; only the ALB's two public IPv4s remain; site 200; `terraform plan` clean.
- [x] ↩ ROLLBACK: set `enable_bastion = true` + targeted apply recreates the bastion from AMI + `user_data` (stateless, minutes) — see `BASTION.md`.

## 10. Verification & close-out

- [ ] 10.1 Confirm realized spend trends toward ~$99/mo in Cost Explorer over the following billing cycle.
- [ ] 10.2 Confirm budget + anomaly alerts are active and correctly scoped.
- [ ] 10.3 Note follow-ups for later (out of scope here): investigate whether `media` is dead code; evaluate CloudFront for structural cost/DDoS resilience.
