output "url" {
  description = "Chat API endpoint the website calls"
  value       = aws_lambda_function_url.chat.function_url
}

output "function_name" {
  value = aws_lambda_function.chat.function_name
}
