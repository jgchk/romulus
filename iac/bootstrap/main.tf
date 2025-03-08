terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.90.0"
    }
  }

  backend "s3" {
    bucket = "romulus-terraform-state-bucket"
    key    = "s3.tfstate"
    region = "us-east-2"
  }

  required_version = ">= 1.11.1"
}

provider "aws" {
  region = "us-east-2"
}
