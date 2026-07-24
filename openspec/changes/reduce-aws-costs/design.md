## Context

Cost Explorer (June 2026, account `084828602616`, `us-east-2`) confirms ~$209/mo spend on a
near-zero-traffic app (ALB LCU = $0.53/mo). Utilization data gathered over 14 days
(2026-07-10 → 07-24) grounds the right-sizing decisions:

| Resource | Finding |
|---|---|
| 5× RDS `db.t3.micro` | Each uses ~0.9 GB of 1 GB RAM; summed max connections = 37; `genres` bursts to 94.7% CPU; `media` idle (0 conns/0 CPU for 14 days). |
| Fargate (4 tasks) | ~2% avg CPU, brief 95–100% spikes; memory peaks at 15–24% of 512 MB. Already at the `256/512` Fargate floor. |
| VPC endpoints | 3 interface endpoints × 2 AZ = 6 ENIs = $43.20/mo. |

The consolidation target is `db.t3.small` (2 GB), not `db.t3.micro`: five live working sets
cannot share 1 GB. It is not `db.t3.medium` because per-instance overhead (one `shared_buffers`,
one OS, one process set) collapses on consolidation — real combined demand is ~1.3 GB, which
fits 2 GB with headroom. RDS resize small→medium is a few-minute operation if the soak proves
it tight, so we start small and let the soak validate.

## Goals / Non-Goals

**Goals:**
- Cut spend ~$209 → ~$99/mo without losing meaningful function.
- **Invariant: at any point before deliberate decommission, roll back to the previous state
  with no data loss.** Slight downtime (minutes) is acceptable.
- Replace the WAF's illusory cost-protection with real, free cost alerting.

**Non-Goals:**
- Zero-downtime RDS migration (logical replication) — adds complexity/failure modes not
  justified for a hobby project; a short quiesced-write cutover is simpler and therefore safer.
- CloudFront / structural DDoS resilience — recommended future follow-up, out of scope here.
- Determining whether the `media` database is dead code — migrate it now; investigate separately.
- Any application code change.

## Decisions

### D1 — Risk triage: only RDS carries data risk
Five of six changes are stateless config; rollback is `git revert` + `terraform apply`
(seconds–minutes). The entire safety design therefore concentrates on the RDS consolidation.

### D2 — RDS migration: additive → cutover → soak → decommission
Never mutate in place. Build the new instance alongside the old five, prove it, cut over, and
keep the old five fully intact and running until a 3–7 day soak passes and we *deliberately*
decommission them. Phases and go/no-go gates are enumerated in tasks.md (Phases 0–5).

### D3 — Three independent recovery points
1. **Manual snapshots** of all five instances taken in pre-flight (Phase 0).
2. **Live old instances** retained, powered on, through the entire soak (Phase 4).
3. **Final snapshots** taken automatically on decommission (`skip_final_snapshot = false`).
At no moment before Phase 5 completes is there a single point of unrecoverable failure.

### D4 — Lossless cutover via a short downtime window
Set `backend` `desired_count = 0` to stop writes, run the final `pg_dump`/restore of the small
delta, verify, then repoint `*_DATABASE_URL`s and scale back up. Because writes are stopped
before the final sync, old and new are byte-identical at the switch — the cutover itself loses
nothing. Rollback = repoint URLs to the untouched old instances and redeploy.

### D5 — Sequencing
```
1. Budgets + Anomaly Detection      (cost safety net ON first)
2. WAF drop · Fargate 2→1 · endpoints single-AZ   (reversible, banks ~$50/mo)
3. RDS consolidation                (phased runbook — bastion required here)
4. Bastion removal                  (LAST — after migration + SSM access tested)
```
Reversible wins first to bank savings and validate the pipeline; bastion removed last because
the migration runs from it.

### D6 — Terraform guardrails against accidental destroy
- `terraform plan` reviewed before **every** apply, explicitly scanning for unexpected
  `destroy`. The old RDS instances must not appear in a destroy plan until Phase 5.
- `deletion_protection = true` stays on the old instances until a deliberate two-step teardown
  (flip protection off in one reviewed apply; destroy in the next).
- Provision and destroy are never the same apply.
- State is S3-versioned with a DynamoDB lock — the state file itself has a rollback path.
- Snapshot before every RDS-touching apply, not only once.

### D7 — Consolidated credentials
The new instance hosts five databases. All five source instances already use the **same**
master username `dbadmin` (isolated only by being separate instances), so five identically-named
roles can't coexist on one instance. Decision: a **single `dbadmin` master owning all five
databases** (`authn`, `authz`, `genres`, `user_settings`, `media`), stored in a new
`consolidated-db-credentials` secret. Each `*_DATABASE_URL` changes host + password but keeps
its username and database name; restore ownership maps cleanly because the owner stays `dbadmin`.
This preserves the existing trust model exactly (the backend already holds all five URLs, so a
single credential grants no access it didn't already have). Per-database role isolation would be
a security *improvement* but is out of scope here — noted as a follow-up (task 10.3).

### D8 — Reconcile pre-existing drift before touching anything (discovered during apply)
The committed Terraform had drifted from deployed state in two ways that made *any* untargeted
apply unsafe: (1) ECS task definitions default their image tags to `:latest` while the running
services use specific build SHAs (CI passes them via `-var`), so a local apply would redeploy
both services onto `:latest`; and (2) the bastion's `most_recent` Ubuntu AMI lookup drifts as
Canonical publishes images, forcing a bastion replacement — the host we need alive for the
migration. Reconciled up front (tasks group 0): pin the deployed image tags in the (gitignored)
`terraform.tfvars`, and `ignore_changes = [ami]` on the bastion. After reconciliation, plans
show only intended changes, which is the precondition for the plan-review gate (D6) to be
meaningful during the RDS phases.

## Risks / Trade-offs

- **Soak-window writes (the one honest gap):** rolling back *during* the Phase 4 soak loses
  writes made to the new instance during the soak — they are not on the old instances.
  Eliminating this fully needs dual-write/logical replication (rejected, D2/Non-Goals).
  Mitigated by: tiny write volume, minutes-long Phase 3 verification (so soak rollbacks are
  rare), and manual snapshots + the new instance's own backups for manual forward-recovery.
- **`db.t3.small` proves tight:** possible but unlikely (D1 sizing). Mitigation: resize to
  `medium` in minutes; the soak is the detection mechanism.
- **Single-AZ endpoints:** if that AZ's endpoint degrades, tasks cannot pull images. Acceptable
  at `desired_count = 1` (single-AZ effectively already); rollback is adding the subnet back.
- **Lone Fargate task:** brief CPU saturation possible during 95–100% spikes and no failover
  during deploys/AZ events. Acceptable at this traffic; rollback is `desired_count = 2`.
- **Dropping the WAF:** momentarily removes `.env`/`info.php` probe blocking (negligible value)
  and relies on fixed-size compute + Budgets/Anomaly Detection for cost-attack protection.
  A traffic-based attack cannot scale fixed-size Fargate/RDS; alerting catches egress/log
  ballooning within hours. CloudFront is the recommended future upgrade for structural
  resilience.
