variable "allowed_ssh_ip" {
  description = "IP address allowed to SSH into the bastion host (in CIDR notation)"
  type        = string
}

resource "aws_security_group" "bastion" {
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "bastion-sg"
  }
}

variable "bastion_public_key" {
  description = "Public key for the bastion host"
  type        = string
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.bastion.key_name
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  user_data                   = <<-EOF
                                #!/bin/bash
                                apt-get update -y
                                apt-get install -y postgresql-client
                                EOF
  tags = {
    Name = "bastion-host"
  }
}

resource "aws_key_pair" "bastion" {
  key_name   = "bastion-key"
  public_key = var.bastion_public_key
}
