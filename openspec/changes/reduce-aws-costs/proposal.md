## Why

The project spends ~$209/month on AWS (verified via Cost Explorer, June 2026) for a
near-zero-traffic hobby application — the ALB processed just $0.53 of LCU in June. The
spend is dominated by over-provisioned, production-grade infrastructure the traffic does
not justify: **five separate RDS instances** ($77.85), **VPC interface endpoints duplicated
across two AZs** ($43.20 — the second-largest line item), **four Fargate tasks** ($37.13),
and an **always-on bastion** ($8.35). Right-sizing these to match actual usage roughly
halves the bill with no meaningful loss of function.

## What Changes

- **Consolidate RDS**: replace 5× `db.t3.micro` PostgreSQL instances (`authentication`,
  `authorization`, `genres`, `user-settings`, `media`) with **one `db.t3.small`** hosting
  all five databases. Logical separation (databases, credentials, migrations) is preserved;
  only the physical instances collapse. **BREAKING** for connection strings — all five
  `*_DATABASE_URL`s change host. Migrated via a phased, gated cutover (see design.md).
- **Reduce Fargate**: `frontend-service` and `backend-service` `desired_count` 2 → 1.
  (Task size stays `256/512` — already the Fargate minimum; memory cannot be reduced.)
- **Single-AZ VPC endpoints**: the three interface endpoints (`ecr.dkr`, `ecr.api`, `logs`)
  drop from two private subnets to one. Tasks remain fully private (no NAT, no public IPs).
- **Remove the bastion**: terminate the always-on `t2.micro` jump host and its public IP;
  access RDS on demand via SSM / ECS Exec afterward. Removed **last**, after the RDS
  migration (which uses it) is complete and the replacement access path is tested.
- **Drop the WAF**: remove the WebACL. Its two rules (`.env`/`info.php` probe blocking)
  save ~$0 downstream at this traffic while costing ~$8/mo.
- **Add free cost protection**: an AWS Budget with threshold alerts plus Cost Anomaly
  Detection, so any future cost ballooning (e.g. a traffic-based attack) is caught within
  hours. This replaces the WAF's (illusory) cost-protection value at no cost.

Target: **~$209/mo → ~$99/mo (≈ 53% reduction)**, entirely via reversible config plus one
carefully-migrated stateful component.

## Capabilities

### New Capabilities
- `cloud-infrastructure`: Target-state requirements for the AWS deployment topology —
  consolidated database, right-sized compute, private networking, and cost observability.

### Modified Capabilities
<!-- None. No application-level capability requirements change; this is infrastructure right-sizing. -->

## Impact

- **Terraform** (`iac/application/`): `rds.tf` (consolidate), `ecs.tf` (`desired_count`,
  `*_DATABASE_URL` endpoints), `vpc.tf` (endpoint subnets), `bastion.tf` (remove),
  `waf.tf` (remove), plus new budget/anomaly-detection resources and updates to
  `secrets.tf` for consolidated credentials.
- **Data**: five production databases migrated. Governed by the safety architecture in
  design.md — no data loss at any rollback point prior to deliberate decommission.
- **Runtime**: brief backend downtime (a few minutes) during the RDS cutover window.
- **Access**: DBA/maintenance access shifts from the bastion to SSM / ECS Exec.
- **No application code changes** — only infrastructure and connection configuration.
