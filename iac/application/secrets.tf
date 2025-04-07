resource "random_password" "authentication_password" {
  length  = 16
  special = false
}

resource "random_password" "authorization_password" {
  length  = 16
  special = false
}

resource "random_password" "genres_password" {
  length  = 16
  special = false
}

resource "random_password" "user_settings_password" {
  length  = 16
  special = false
}

resource "random_password" "media_password" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "postgresdb-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    authentication_username = "dbadmin"
    authentication_password = random_password.authentication_password.result
    authorization_username  = "dbadmin"
    authorization_password  = random_password.authorization_password.result
    genres_username         = "dbadmin"
    genres_password         = random_password.genres_password.result
    user_settings_username  = "dbadmin"
    user_settings_password  = random_password.user_settings_password.result
  })
}

resource "aws_secretsmanager_secret_version" "media_db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.media_password.result
  })
}

resource "aws_iam_policy" "secrets_manager_access" {
  name        = "SecretsManagerAccess"
  description = "Allow access to db credentials in Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.db_credentials.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "secrets_manager_access" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.secrets_manager_access.arn
}
