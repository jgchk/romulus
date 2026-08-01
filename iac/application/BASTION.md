# Break-glass DB access (bastion)

The bastion host is **disabled by default** (`enable_bastion = false` in
`bastion.tf`) and costs nothing while off. It is stateless — every enable
provisions a fresh Ubuntu instance from AMI + `user_data` (~2 minutes), and
every disable destroys it completely. Use it for ad-hoc access to the
`consolidated` RDS instance (databases: `authn`, `authz`, `genres`,
`user_settings`, `media`).

## Enable

All commands run from `iac/application` with `AWS_PROFILE=romulus`.

1. **Update the SSH allowlist to your current IP** (it's dynamic — this is the
   most common reason a re-enabled bastion "doesn't work"):

   ```sh
   curl -s ifconfig.me   # then set allowed_ssh_ip in terraform.tfvars (CIDR, e.g. x.y.z.0/24)
   ```

2. **Enable and apply, targeting only the bastion resources.** Targeting
   matters: the gitignored `frontend_image_tag`/`backend_image_tag` pins in
   `terraform.tfvars` go stale after every CI deploy, and an untargeted local
   apply would revert the running services to those older images.

   ```sh
   # in terraform.tfvars: enable_bastion = true
   terraform apply \
     -target='aws_key_pair.bastion[0]' \
     -target='aws_security_group.bastion[0]' \
     -target='aws_instance.bastion[0]' \
     -target='aws_security_group.postgres'
   ```

3. **Connect.** The bastion's IP is in the apply output (`bastion_public_ip`).
   Get the DB credentials from Secrets Manager without echoing them:

   ```sh
   ssh ubuntu@$(terraform output -raw bastion_public_ip)
   # on the bastion — build ~/.pgpass so the password never hits the shell history:
   # host:5432:*:dbadmin:<password from the consolidated-db-credentials secret>
   aws secretsmanager get-secret-value --secret-id consolidated-db-credentials \
     --query SecretString --output text   # run this LOCALLY, copy the password over
   psql -h <consolidated-endpoint> -U dbadmin -d genres
   ```

   The endpoint is `terraform output`-less; get it with:

   ```sh
   aws rds describe-db-instances --db-instance-identifier consolidated \
     --query 'DBInstances[0].Endpoint.Address' --output text
   ```

4. **Disable when done** — remove anything sensitive you created on the
   bastion (e.g. `~/.pgpass`), then:

   ```sh
   # in terraform.tfvars: enable_bastion = false
   terraform apply \
     -target='aws_key_pair.bastion[0]' \
     -target='aws_security_group.bastion[0]' \
     -target='aws_instance.bastion[0]' \
     -target='aws_security_group.postgres'
   ```

## Caveats

- **CI will tear down an enabled bastion.** Deploys pass only the standard
  `-var`s, so `enable_bastion` falls back to its `false` default — any push to
  `main` while the bastion is up destroys it mid-session. Fine for the
  infrastructure (it's disposable), annoying if you're mid-query. Don't push
  during a maintenance session.
- The instance volume is destroyed on disable, so nothing you leave on the
  bastion survives — but scrub credentials anyway (`shred -u ~/.pgpass`).
- The SSH key pair is `bastion_public_key` in `terraform.tfvars` (the private
  half lives in `~/.ssh` locally, never in the repo).
