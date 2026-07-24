# Cost safety net: alerts a maintainer when spend deviates from the expected baseline.
# See openspec change `reduce-aws-costs` (task group 1). Purely additive — no effect on
# running infrastructure; it only creates budget + anomaly-detection alerting.

variable "cost_alert_email" {
  description = "Email address for AWS budget and cost anomaly alerts"
  type        = string
  # Supplied by the COST_ALERT_EMAIL GitHub secret in CI (see deploy.yaml) and by
  # terraform.tfvars locally. No default — kept out of the repo.
}

# Cost Explorer / Anomaly Detection expose their API only in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# --- Monthly budget with threshold alerts ---
resource "aws_budgets_budget" "monthly" {
  name         = "romulus-monthly"
  budget_type  = "COST"
  limit_amount = "130"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.cost_alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.cost_alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 120
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.cost_alert_email]
  }

  # Early warning: forecasted to exceed the monthly limit.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.cost_alert_email]
  }
}

# --- Cost Anomaly Detection ---
resource "aws_ce_anomaly_monitor" "service" {
  provider          = aws.us_east_1
  name              = "romulus-service-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "alerts" {
  provider         = aws.us_east_1
  name             = "romulus-anomaly-alerts"
  frequency        = "DAILY"
  monitor_arn_list = [aws_ce_anomaly_monitor.service.arn]

  subscriber {
    type    = "EMAIL"
    address = var.cost_alert_email
  }

  # Notify when an anomaly's absolute cost impact is >= $10.
  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      match_options = ["GREATER_THAN_OR_EQUAL"]
      values        = ["10"]
    }
  }
}
