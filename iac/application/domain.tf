variable "domain_name" {
  description = "The domain for the application"
  type        = string
  default     = "romulus.lol"
}

variable "cloudflare_zone_id" {
  description = "The Cloudflare zone ID"
  type        = string
}

resource "aws_acm_certificate" "my_domain" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "my_domain" {
  certificate_arn         = aws_acm_certificate.my_domain.arn
  validation_record_fqdns = [for record in cloudflare_dns_record.cert_validation : record.name]
}

resource "cloudflare_dns_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.my_domain.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      type    = dvo.resource_record_type
      content = dvo.resource_record_value
    }
  }
  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.content
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "root" {
  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = "@"
  content = aws_lb.frontend.dns_name
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "www" {
  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = "www"
  content = aws_lb.frontend.dns_name
  ttl     = 1
  proxied = false
}
