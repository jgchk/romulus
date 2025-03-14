resource "aws_security_group" "postgres" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id, aws_security_group.bastion.id]
  }

  tags = {
    Name = "postgres-sg"
  }
}

resource "aws_db_subnet_group" "postgres" {
  name       = "postgres-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "authentication" {
  identifier                = "authentication"
  engine                    = "postgres"
  engine_version            = "15"
  instance_class            = "db.t3.micro"
  allocated_storage         = 20
  username                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["authentication_username"]
  password                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["authentication_password"]
  db_subnet_group_name      = aws_db_subnet_group.postgres.name
  vpc_security_group_ids    = [aws_security_group.postgres.id]
  db_name                   = "authn"
  skip_final_snapshot       = false
  final_snapshot_identifier = "authentication-final-snapshot-${replace(timestamp(), ":", "-")}"

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

resource "aws_db_instance" "authorization" {
  identifier                = "authorization"
  engine                    = "postgres"
  engine_version            = "15"
  instance_class            = "db.t3.micro"
  allocated_storage         = 20
  username                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["authorization_username"]
  password                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["authorization_password"]
  db_subnet_group_name      = aws_db_subnet_group.postgres.name
  vpc_security_group_ids    = [aws_security_group.postgres.id]
  db_name                   = "authz"
  skip_final_snapshot       = false
  final_snapshot_identifier = "authorization-final-snapshot-${replace(timestamp(), ":", "-")}"

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

resource "aws_db_instance" "genres" {
  identifier                = "genres"
  engine                    = "postgres"
  engine_version            = "15"
  instance_class            = "db.t3.micro"
  allocated_storage         = 20
  username                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["genres_username"]
  password                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["genres_password"]
  db_subnet_group_name      = aws_db_subnet_group.postgres.name
  vpc_security_group_ids    = [aws_security_group.postgres.id]
  db_name                   = "genres"
  skip_final_snapshot       = false
  final_snapshot_identifier = "genres-final-snapshot-${replace(timestamp(), ":", "-")}"

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

resource "aws_db_instance" "user_settings" {
  identifier                = "user-settings"
  engine                    = "postgres"
  engine_version            = "15"
  instance_class            = "db.t3.micro"
  allocated_storage         = 20
  username                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["user_settings_username"]
  password                  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["user_settings_password"]
  db_subnet_group_name      = aws_db_subnet_group.postgres.name
  vpc_security_group_ids    = [aws_security_group.postgres.id]
  db_name                   = "user_settings"
  skip_final_snapshot       = false
  final_snapshot_identifier = "user-settings-final-snapshot-${replace(timestamp(), ":", "-")}"

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
