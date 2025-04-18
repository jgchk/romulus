variable "frontend_image_tag" {
  description = "Tag for the frontend ECR image"
  type        = string
  default     = "latest" # Fallback to latest if not specified
}

variable "backend_image_tag" {
  description = "Tag for the backend ECR image"
  type        = string
  default     = "latest" # Fallback to latest if not specified
}

resource "aws_ecs_cluster" "main" {
  name = "main-cluster"
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  container_definitions = jsonencode([{
    name  = "frontend"
    image = "${aws_ecr_repository.frontend.repository_url}:${var.frontend_image_tag}"
    portMappings = [{
      containerPort = 3000
    }]
    environment = [
      {
        name  = "API_BASE_URL"
        value = "http://backend.local:3000"
      },
      {
        name  = "ORIGIN"
        value = "https://${var.domain_name}"
      }
    ]
    healthCheck = {
      command = [
        "CMD-SHELL",
        # Forward output to logs
        # See https://docs.aws.amazon.com/AmazonECS/latest/developerguide/view-container-health.html
        "wget -q --tries=1 --spider --server-response http://localhost:3000/api/health >> /proc/1/fd/1 2>&1 || exit 1"
      ]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
    stopTimeout = 30
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/frontend"
        "awslogs-region"        = "us-east-2"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
    portMappings = [{
      containerPort = 3000
    }]
    environment = [
      {
        name  = "AUTHENTICATION_DATABASE_URL"
        value = "postgresql://${aws_db_instance.authentication.username}:${aws_db_instance.authentication.password}@${aws_db_instance.authentication.endpoint}/${aws_db_instance.authentication.db_name}?sslmode=require"
      },
      {
        name  = "AUTHORIZATION_DATABASE_URL"
        value = "postgresql://${aws_db_instance.authorization.username}:${aws_db_instance.authorization.password}@${aws_db_instance.authorization.endpoint}/${aws_db_instance.authorization.db_name}?sslmode=require"
      },
      {
        name  = "GENRES_DATABASE_URL"
        value = "postgresql://${aws_db_instance.genres.username}:${aws_db_instance.genres.password}@${aws_db_instance.genres.endpoint}/${aws_db_instance.genres.db_name}?sslmode=require"
      },
      {
        name  = "USER_SETTINGS_DATABASE_URL"
        value = "postgresql://${aws_db_instance.user_settings.username}:${aws_db_instance.user_settings.password}@${aws_db_instance.user_settings.endpoint}/${aws_db_instance.user_settings.db_name}?sslmode=require"
      },
      {
        name  = "MEDIA_DATABASE_URL"
        value = "postgresql://${aws_db_instance.media.username}:${aws_db_instance.media.password}@${aws_db_instance.media.endpoint}/${aws_db_instance.media.db_name}?sslmode=require"
      },
      {
        name  = "ENABLE_DEV_ADMIN_ACCOUNT"
        value = "false"
      }
    ]
    healthCheck = {
      command = [
        "CMD-SHELL",
        # Forward output to logs
        # See https://docs.aws.amazon.com/AmazonECS/latest/developerguide/view-container-health.html
        "wget -q --tries=1 --spider --server-response http://localhost:3000/health >> /proc/1/fd/1 2>&1 || exit 1"
      ]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
    stopTimeout = 30
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/backend"
        "awslogs-region"        = "us-east-2"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "frontend" {
  name            = "frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  # This forces a new deployment when task definition changes
  force_new_deployment = true

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.frontend_https]
}

resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  # This forces a new deployment when task definition changes
  force_new_deployment = true

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false
  }
  service_registries {
    registry_arn = aws_service_discovery_service.backend.arn
  }
}
