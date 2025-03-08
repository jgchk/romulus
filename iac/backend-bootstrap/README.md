1. Perform the terraform apply with local backend.
2. Once the storage container is created. Create backend configuration pointing it to the newly created storage container.
3. Now perform terraform init. It will ask to migrate state. Say yes and go ahead. Now you have the state configured.
