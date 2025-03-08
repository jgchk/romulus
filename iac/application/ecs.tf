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
    image = "${aws_ecr_repository.frontend.repository_url}:latest"
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
        value = "http://${aws_lb.frontend.dns_name}"
      }
    ]
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
    image = "${aws_ecr_repository.backend.repository_url}:latest"
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
      }
    ]
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
  desired_count   = 1
  launch_type     = "FARGATE"
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
}

resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false
  }
  service_registries {
    registry_arn = aws_service_discovery_service.backend.arn
  }
}

