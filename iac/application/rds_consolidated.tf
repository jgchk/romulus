# Consolidated RDS instance hosting all five databases (openspec change
# `reduce-aws-costs`, Phase 1). Additive — created alongside the existing five
# instances, which remain untouched until the deliberate Phase 5 decommission.
# The five databases (authn, authz, genres, user_settings, media) are created on
# this instance out-of-band via SQL during Phase 1/2.

resource "random_password" "consolidated_password" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "consolidated_db_credentials" {
  name = "consolidated-db-credentials"
}

resource "aws_secretsmanager_secret_version" "consolidated_db_credentials" {
  secret_id = aws_secretsmanager_secret.consolidated_db_credentials.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.consolidated_password.result
  })
}

resource "aws_db_instance" "consolidated" {
  identifier             = "consolidated"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.small"
  allocated_storage      = 20
  username               = "dbadmin"
  password               = random_password.consolidated_password.result
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.postgres.id]
  # No db_name: all five databases are created explicitly via SQL so they are
  # uniform (none is the implicit master database).
  skip_final_snapshot       = false
  final_snapshot_identifier = "consolidated-final-snapshot-${replace(timestamp(), ":", "-")}"
  deletion_protection       = true

  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:30-Sun:05:30"
  copy_tags_to_snapshot   = true

  lifecycle {
    ignore_changes = [
      final_snapshot_identifier,
    ]
  }
}
