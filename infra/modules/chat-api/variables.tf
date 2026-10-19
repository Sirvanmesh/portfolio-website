variable "project" {
  description = "Short project name, used in resource names"
  type        = string
}

variable "environment" {
  description = "dev or prod"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod."
  }
}

variable "allowed_origins" {
  description = "Website origins that may call the chat API, e.g. https://d123.cloudfront.net"
  type        = list(string)
}

variable "anthropic_key_param" {
  description = "SSM SecureString parameter that holds the Anthropic API key (created by hand, never in Terraform)"
  type        = string
  default     = "/portfolio-website/anthropic-api-key"
}

variable "permissions_boundary_arn" {
  description = "Permissions boundary from the bootstrap stack; the deploy role can only create roles that use it"
  type        = string
}

variable "bundle_path" {
  description = "Built Lambda bundle (npm run build:chat)"
  type        = string
}
