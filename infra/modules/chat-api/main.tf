terraform {
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
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  name      = "${var.project}-${var.environment}-chat"
  param_arn = "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter${var.anthropic_key_param}"
}

# ---------- rate limit counters (one row per visitor per hour/day, auto-deleted) ----------

resource "aws_dynamodb_table" "rate_limit" {
  name         = "${local.name}-rate-limit"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }
}

# ---------- Lambda role: logs, its own table, and the key parameter only ----------

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "chat" {
  name                 = local.name
  assume_role_policy   = data.aws_iam_policy_document.assume.json
  permissions_boundary = var.permissions_boundary_arn
}

data "aws_iam_policy_document" "chat" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.chat.arn}:*"]
  }
  statement {
    sid       = "RateLimitTable"
    actions   = ["dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.rate_limit.arn]
  }
  statement {
    sid       = "AnthropicKey"
    actions   = ["ssm:GetParameter"]
    resources = [local.param_arn]
  }
  statement {
    sid       = "DecryptKey"
    actions   = ["kms:Decrypt"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["ssm.${data.aws_region.current.region}.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "chat" {
  name   = "chat"
  role   = aws_iam_role.chat.id
  policy = data.aws_iam_policy_document.chat.json
}

# ---------- the function ----------

resource "aws_cloudwatch_log_group" "chat" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 14
}

data "archive_file" "chat" {
  type        = "zip"
  source_file = var.bundle_path
  output_path = "${path.root}/.build/chat.zip"
}

resource "aws_lambda_function" "chat" {
  function_name    = local.name
  description      = "Portfolio chat bot: answers questions about Mohammad with Claude"
  role             = aws_iam_role.chat.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  filename         = data.archive_file.chat.output_path
  source_code_hash = data.archive_file.chat.output_base64sha256
  memory_size      = 256
  timeout          = 30

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.chat.name
  }

  environment {
    variables = {
      RATE_LIMIT_TABLE    = aws_dynamodb_table.rate_limit.name
      ANTHROPIC_KEY_PARAM = var.anthropic_key_param
      ALLOWED_ORIGINS     = join(",", var.allowed_origins)
    }
  }

  depends_on = [aws_iam_role_policy.chat]
}

# ---------- public HTTPS endpoint, callable only from the site's origins (CORS) ----------

resource "aws_lambda_function_url" "chat" {
  function_name      = aws_lambda_function.chat.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = var.allowed_origins
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_lambda_permission" "url" {
  statement_id           = "PublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.chat.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "invoke" {
  statement_id             = "PublicInvokeViaUrl"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.chat.function_name
  principal                = "*"
  invoked_via_function_url = true
}
