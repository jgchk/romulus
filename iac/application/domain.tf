variable "domain_name" {
  description = "The domain for the application"
  type        = string
  default     = "new.romulus.lol"
}

resource "aws_acm_certificate" "my_domain" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}
