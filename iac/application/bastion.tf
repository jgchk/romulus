# Break-glass bastion for ad-hoc DB access (openspec change `reduce-aws-costs`,
# Group 9). Disabled by default — the instance, key pair, and SG only exist
# while `enable_bastion = true`. The bastion is stateless (recreated from AMI +
# user_data in ~2 minutes), so nothing is lost by tearing it down.
# See BASTION.md for the enable/use/disable procedure.

variable "enable_bastion" {
  description = "Provision the break-glass bastion host. Keep false except during active DB maintenance; CI deploys leave it at the default, so a push while enabled will tear the bastion down."
  type        = bool
  default     = false
}

variable "allowed_ssh_ip" {
  description = "IP address allowed to SSH into the bastion host (in CIDR notation)"
  type        = string
}

resource "aws_security_group" "bastion" {
  count  = var.enable_bastion ? 1 : 0
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
  count                       = var.enable_bastion ? 1 : 0
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.bastion[0].key_name
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.bastion[0].id]
  associate_public_ip_address = true
  user_data                   = <<-EOF
                                #!/bin/bash
                                apt-get update -y
                                apt-get install -y postgresql-client
                                EOF
  tags = {
    Name = "bastion-host"
  }

  # The Ubuntu AMI lookup uses most_recent, which drifts whenever Canonical
  # publishes a new image and would otherwise force a bastion replacement on
  # every apply while enabled. The bastion is disposable anyway.
  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_key_pair" "bastion" {
  count      = var.enable_bastion ? 1 : 0
  key_name   = "bastion-key"
  public_key = var.bastion_public_key
}

output "bastion_public_ip" {
  description = "Public IP of the break-glass bastion (null when disabled)"
  value       = var.enable_bastion ? aws_instance.bastion[0].public_ip : null
}
