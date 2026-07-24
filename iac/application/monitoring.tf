# Hands-off health monitoring for the consolidated RDS instance (openspec change
# reduce-aws-costs). CloudWatch alarms → SNS email. Credential-free and always-on
# (unlike a scheduled CLI check, which would fail once the SSO session expires).
# Kept permanently — ongoing RDS health monitoring, not just the soak.

resource "aws_sns_topic" "alerts" {
  name = "romulus-rds-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.cost_alert_email
}

# High CPU — sustained load the burstable instance can't absorb.
resource "aws_cloudwatch_metric_alarm" "consolidated_cpu" {
  alarm_name          = "consolidated-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Consolidated RDS CPU > 80% for 10 min"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.consolidated.identifier }
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# Low freeable memory — the key soak signal. If this trips, db.t3.small is too
# tight and we resize to db.t3.medium. Currently ~1 GB free of 2 GB.
resource "aws_cloudwatch_metric_alarm" "consolidated_memory" {
  alarm_name          = "consolidated-rds-low-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 268435456 # 256 MB
  alarm_description   = "Consolidated RDS freeable memory < 256MB — instance may be too small; consider db.t3.medium"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.consolidated.identifier }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Low free storage.
resource "aws_cloudwatch_metric_alarm" "consolidated_storage" {
  alarm_name          = "consolidated-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2147483648 # 2 GB
  alarm_description   = "Consolidated RDS free storage < 2GB"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.consolidated.identifier }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
