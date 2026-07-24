## ADDED Requirements

### Requirement: Consolidated Database Instance

The system SHALL run all application databases (`authn`, `authz`, `genres`, `user_settings`,
`media`) on a single RDS PostgreSQL instance, preserving per-database logical separation and
credentials, rather than one instance per database.

#### Scenario: All databases reachable on the consolidated instance

- **WHEN** the backend service connects using each `*_DATABASE_URL`
- **THEN** every URL resolves to the same consolidated instance host and connects to its
  respective database successfully

#### Scenario: Migration preserves data

- **WHEN** a database is migrated onto the consolidated instance
- **THEN** its per-table row counts and data checksums match the source instance before cutover

### Requirement: Right-Sized Compute

The system SHALL run one task per ECS service (`frontend`, `backend`) at the minimum viable
Fargate task size, sufficient for observed load.

#### Scenario: Single task serves traffic

- **WHEN** a service runs at `desired_count = 1`
- **THEN** the application remains healthy end-to-end under normal traffic

### Requirement: Private Task Networking Without NAT

The system SHALL keep ECS tasks in private subnets with no public IPs and no NAT gateway,
reaching AWS services through VPC endpoints.

#### Scenario: Tasks pull images and ship logs privately

- **WHEN** a forced ECS deployment runs
- **THEN** tasks pull container images from ECR and deliver logs to CloudWatch via VPC
  endpoints, without a public route to the internet

### Requirement: Cost Observability

The system SHALL alert a maintainer when spend deviates from the expected baseline, via an
AWS Budget with threshold alerts and Cost Anomaly Detection.

#### Scenario: Budget threshold breach notifies maintainer

- **WHEN** month-to-date spend crosses a configured budget threshold
- **THEN** an alert email is sent to the maintainer

#### Scenario: Anomalous spend is detected

- **WHEN** daily spend deviates significantly from the learned baseline
- **THEN** Cost Anomaly Detection notifies the maintainer
