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

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 = North America + Europe edge locations (cheapest)."
  type        = string
  default     = "PriceClass_100"
}
