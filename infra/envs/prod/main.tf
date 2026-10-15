# prod environment. State lives in the S3 bucket created by infra/bootstrap.
# The workflow passes bucket, key and region with -backend-config (see .github/workflows).
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    use_lockfile = true
    encrypt      = true
  }
}

variable "aws_region" {
  description = "Region for the S3 bucket (CloudFront itself is global)"
  type        = string
  default     = "ca-central-1"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      project     = "portfolio-website"
      environment = "prod"
      managed_by  = "terraform"
    }
  }
}

module "site" {
  source      = "../../modules/static-site"
  project     = "portfolio-website"
  environment = "prod"
}

output "bucket_name" {
  value = module.site.bucket_name
}

output "distribution_id" {
  value = module.site.distribution_id
}

output "site_url" {
  value = module.site.site_url
}
