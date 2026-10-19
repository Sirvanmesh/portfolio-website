# dev environment. State lives in the S3 bucket created by infra/bootstrap.
# The workflow passes bucket, key and region with -backend-config (see .github/workflows).
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
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
      environment = "dev"
      managed_by  = "terraform"
    }
  }
}

module "site" {
  source      = "../../modules/static-site"
  project     = "portfolio-website"
  environment = "dev"
}

data "aws_caller_identity" "current" {}

module "chat" {
  source                   = "../../modules/chat-api"
  project                  = "portfolio-website"
  environment              = "dev"
  allowed_origins          = [module.site.site_url, "http://localhost:3000"]
  permissions_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/portfolio-website-chat-boundary"
  bundle_path              = "${path.root}/../../../chat-api/dist/index.mjs"
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

output "chat_api_url" {
  value = module.chat.url
}
