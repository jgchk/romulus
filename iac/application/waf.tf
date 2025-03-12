# Define the WAF Web ACL
resource "aws_wafv2_web_acl" "block_malicious_requests" {
  name        = "BlockMaliciousRequests"
  description = "Web ACL to block requests targeting sensitive files"
  scope       = "REGIONAL" # Use REGIONAL for ALB

  default_action {
    allow {} # Allow all requests by default, block only those matching rules
  }

  # Rule to block requests targeting .env files
  rule {
    name     = "BlockDotEnvRequests"
    priority = 1

    action {
      block {} # Block matching requests
    }

    statement {
      regex_pattern_set_reference_statement {
        arn = aws_wafv2_regex_pattern_set.dot_env.arn
        field_to_match {
          uri_path {} # Match against the URI path
        }
        text_transformation {
          priority = 1
          type     = "LOWERCASE" # Ensure case-insensitive matching
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockDotEnvRequests"
      sampled_requests_enabled   = true
    }
  }

  # Optional: Rule to block requests to /info.php
  rule {
    name     = "BlockInfoPhp"
    priority = 2

    action {
      block {}
    }

    statement {
      byte_match_statement {
        search_string = "/info.php"
        field_to_match {
          uri_path {}
        }
        positional_constraint = "EXACTLY" # Exact match for /info.php
        text_transformation {
          priority = 1
          type     = "NONE" # No transformation needed
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockInfoPhp"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "BlockMaliciousRequests"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "BlockMaliciousRequestsACL"
  }
}

# Define the regex pattern set for .env files
resource "aws_wafv2_regex_pattern_set" "dot_env" {
  name        = "DotEnvPatternSet"
  description = "Regex pattern to match .env files"
  scope       = "REGIONAL"

  regular_expression {
    regex_string = "\\.env(\\..*)?$" # Matches .env and variations like .env.local
  }

  tags = {
    Name = "DotEnvPatternSet"
  }
}

# Associate the Web ACL with the ALB
resource "aws_wafv2_web_acl_association" "alb_association" {
  resource_arn = aws_lb.frontend.arn # Reference your existing ALB
  web_acl_arn  = aws_wafv2_web_acl.block_malicious_requests.arn
}

# Optional: Enable logging for the Web ACL
resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  log_destination_configs = [aws_cloudwatch_log_group.waf_logs.arn]
  resource_arn            = aws_wafv2_web_acl.block_malicious_requests.arn
}

resource "aws_cloudwatch_log_group" "waf_logs" {
  name              = "aws-waf-logs-block_malicious_requests"
  retention_in_days = 14

  tags = {
    Name = "WAFLogs"
  }
}
