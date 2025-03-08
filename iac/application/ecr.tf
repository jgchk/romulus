resource "aws_ecr_repository" "backend" {
  name = "backend"
}

resource "aws_ecr_repository" "frontend" {
  name = "frontend"
}
