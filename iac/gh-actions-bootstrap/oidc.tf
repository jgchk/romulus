data "aws_caller_identity" "current" {}

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
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          "ecr:ListTagsForResource"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ecs:DescribeClusters",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DeregisterTaskDefinition"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "iam:GetRole",
          "iam:PassRole",
          "iam:ListRolePolicies",
          "iam:GetPolicy",
          "iam:ListAttachedRolePolicies",
          "iam:GetPolicyVersion"
        ],
        "Resource" : [
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ecs_execution_role",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/SecretsManagerAccess"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetResourcePolicy"
        ],
        "Resource" : [
          "arn:aws:secretsmanager:us-east-2:*:secret:postgresdb-credentials*",
          "arn:aws:secretsmanager:us-east-2:*:secret:media-db-credentials*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:ListTagsForResource"
        ],
        "Resource" : [
          "arn:aws:logs:us-east-2:${data.aws_caller_identity.current.account_id}:log-group:*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        "Resource" : [
          "arn:aws:s3:::romulus-terraform-state-bucket",
          "arn:aws:s3:::romulus-terraform-state-bucket/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ec2:DescribeVpcs",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeRouteTables",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeSubnets",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribePrefixLists",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeKeyPairs",
          "ec2:DescribeImages",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeTags",
          "ec2:DescribeInstanceAttribute",
          "ec2:DescribeVolumes",
          "ec2:DescribeInstanceCreditSpecifications",
          "ec2:TerminateInstances",
          "ec2:RebootInstances",
          "ec2:RunInstances",
          "ec2:CreateTags"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "servicediscovery:GetNamespace",
          "servicediscovery:ListTagsForResource",
          "servicediscovery:GetService"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeTargetGroupAttributes",
          "elasticloadbalancing:DescribeLoadBalancerAttributes",
          "elasticloadbalancing:DescribeTags",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeListenerAttributes",
          "elasticloadbalancing:ModifyTargetGroup",
          "elasticloadbalancing:ModifyTargetGroupAttributes",
          "elasticloadbalancing:DescribeRules",
          "elasticloadbalancing:ModifyListener"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "rds:DescribeDBSubnetGroups",
          "rds:ListTagsForResource",
          "rds:DescribeDBInstances",
          "rds:ModifyDBInstance"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ],
        "Resource" : [
          "arn:aws:dynamodb:us-east-2:${data.aws_caller_identity.current.account_id}:table/terraform-locks"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "acm:DescribeCertificate",
          "acm:ListTagsForCertificate",
          "acm:RequestCertificate",
          "acm:DeleteCertificate"
        ],
        "Resource" : [
          "arn:aws:acm:us-east-2:${data.aws_caller_identity.current.account_id}:certificate/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "wafv2:GetRegexPatternSet",
          "wafv2:ListTagsForResource",
          "wafv2:GetWebACL",
          "wafv2:GetLoggingConfiguration",
        ],
        "Resource" : [
          "arn:aws:wafv2:us-east-2:${data.aws_caller_identity.current.account_id}:regional/regexpatternset/DotEnvPatternSet/*",
          "arn:aws:wafv2:us-east-2:${data.aws_caller_identity.current.account_id}:regional/webacl/BlockMaliciousRequests/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "wafv2:GetWebACLForResource"
        ],
        "Resource" : [
          "arn:aws:wafv2:us-east-2:${data.aws_caller_identity.current.account_id}:regional/webacl/*/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "route53:GetHostedZone",
          "route53:ListTagsForResource",
          "route53:ListResourceRecordSets",
          "route53:ChangeResourceRecordSets"
        ],
        "Resource" : [
          "arn:aws:route53:::hostedzone/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "route53:GetChange"
        ],
        "Resource" : [
          "arn:aws:route53:::change/*"
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_deploy" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions_deploy.arn
}
