resource "aws_iam_openid_connect_provider" "github_actions" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

resource "aws_iam_role" "github_actions" {
  name = "github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" : "repo:jgchk/romulus:ref:refs/heads/main"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "github_actions_deploy" {
  name        = "GitHubActionsDeployPolicy"
  description = "Allow GitHub Actions to deploy application"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:*",
          "ecs:*",
          "s3:*",
          "logs:*",
          "secretsmanager:GetSecretValue",
          "iam:PassRole",
          "ec2:Describe*"
        ],
        Resource = "*"
      }
    ]
  })
}
