# AWS EC2 Deployment Guide

This guide explains how to deploy updates to the application running on the AWS EC2 instance. The application runs inside Docker containers, and the process involves syncing your local code to the server and rebuilding the containers.

## Prerequisites

- You need the SSH key file for the EC2 instance (e.g., `rslcardspem.pem`) in your project root or `.ssh` folder.
- Ensure the key has the correct permissions. If not, run:
  ```bash
  chmod 400 rslcardspem.pem
  ```

## 1. Syncing the Code

Use `rsync` to transfer your latest local code to the remote EC2 instance. It is important to exclude large directories that are built automatically (like `node_modules`, `.git`, etc.) to speed up the transfer.

Run the following command from the root of your local repository:

```bash
# Replace 3.231.19.101 with the actual public IP of the EC2 instance if it changes
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.next' \
  --exclude '.expo' \
  --exclude 'apps/dealer-app/node_modules' \
  --exclude 'backend/node_modules' \
  -e "ssh -i rslcardspem.pem -o StrictHostKeyChecking=no" \
  ./ ubuntu@3.231.19.101:~/RSL_Cards/
```

## 2. Restarting Docker Containers

Once the code has synced, you need to rebuild and restart the Docker containers on the server. 

### Development Environment
If the EC2 instance is running the **Dev** stack, execute the following command via SSH:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@3.231.19.101 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build -d"
```

### QA Environment
If the instance is running the **QA** stack, run:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@3.231.19.101 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.qa.yml --env-file infra/docker/.env.qa up --build -d"
```

### Production Environment
If the instance is running the **Production** stack, run:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@3.231.19.101 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up --build -d"
```

## Checking the Deployment

You can verify that the containers are running properly by checking the Docker process list:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@3.231.19.101 "docker ps"
```

To view logs for a specific container (e.g. the backend in dev), you can use:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@3.231.19.101 "cd RSL_Cards && docker compose -f infra/docker/docker-compose.dev.yml logs -f rsl-backend-dev"
```

> **Note:** If you install `make` on the EC2 instance (`sudo apt-get install make`), you can simplify the restart commands to `make dev-restart`, `make qa-restart`, or `make prod-restart`.
