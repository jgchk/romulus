#! /bin/bash

source .env.local

# yarn build

# scp -i "ssh-key.pem" -r . ${EC2_USER}@${EC2_URL}:${EC2_DEST}
rsync -avz -e "ssh -i ssh-key.pem" -r . ${EC2_USER}@${EC2_URL}:${EC2_DEST}