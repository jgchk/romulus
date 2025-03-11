terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.90.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.7.1"
    }
  }

  backend "s3" {
    bucket         = "romulus-terraform-state-bucket"
    key            = "terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
  }

  required_version = ">= 1.11.1"
}

provider "aws" {
  region = "us-east-2"
}
