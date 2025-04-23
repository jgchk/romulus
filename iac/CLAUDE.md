# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `terraform init` - Initialize Terraform in a directory
- `terraform fmt` - Format Terraform code to standard style
- `terraform validate` - Validate Terraform configuration
- `terraform plan` - Preview infrastructure changes
- `terraform apply` - Apply infrastructure changes
- `terraform fmt -check` - Lint to verify formatting
- `terraform test` - Run Terraform tests (if available)

## Code Style Guidelines
- Use HashiCorp Configuration Language (HCL) syntax conventions
- Name resources using snake_case
- Group related resources in dedicated .tf files by function
- Use variables and locals for reusable values
- Comment complex resource configurations
- Use consistent indentation (2 spaces)
- Include required_providers with version constraints
- Specify AWS region in provider configuration
- Use output values for important resource attributes
- Implement proper error handling with count or for_each
- Tag all resources appropriately for cost tracking