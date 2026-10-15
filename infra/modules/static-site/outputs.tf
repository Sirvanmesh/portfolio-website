output "bucket_name" {
  description = "S3 bucket that holds the built site"
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "CloudFront distribution ID (used for cache invalidation)"
  value       = aws_cloudfront_distribution.site.id
}

output "site_url" {
  description = "Public address of the website"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}
