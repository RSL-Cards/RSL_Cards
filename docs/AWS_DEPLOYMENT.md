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
# Replace 100.52.90.163 with the actual public IP of the EC2 instance if it changes
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.next' \
  --exclude '.expo' \
  --exclude 'apps/dealer-app/node_modules' \
  --exclude 'backend/node_modules' \
  -e "ssh -i rslcardspem.pem -o StrictHostKeyChecking=no" \
  ./ ubuntu@100.52.90.163:~/RSL_Cards/
```

## 2. Restarting Docker Containers

Once the code has synced, you need to rebuild and restart the Docker containers on the server. 

### Development Environment
If the EC2 instance is running the **Dev** stack, execute the following command via SSH:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build -d"
```

### QA Environment
If the instance is running the **QA** stack, run:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.qa.yml --env-file infra/docker/.env.qa up --build -d"
```

### Production Environment
If the instance is running the **Production** stack, run:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 \
  "cd RSL_Cards && docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up --build -d"
```

## Checking the Deployment

You can verify that the containers are running properly by checking the Docker process list:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "docker ps"
```

To view logs for a specific container (e.g. the backend in dev), you can use:

```bash
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "cd RSL_Cards && docker compose -f infra/docker/docker-compose.dev.yml logs -f rsl-backend-dev"
```

> **Note:** If you install `make` on the EC2 instance (`sudo apt-get install make`), you can simplify the restart commands to `make dev-restart`, `make qa-restart`, or `make prod-restart`.

## 3. Running Commands & Troubleshooting

### Running Arbitrary Commands on EC2
You can run any command directly on the EC2 instance via SSH without fully logging in by wrapping the command in quotes:

```bash
# Check disk space
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "df -h"

# Check what Docker containers are currently running
ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "docker ps --format '{{.Names}} - {{.Status}}'"
```

### Disk Space Issues ("No space left on device")
Building heavy Docker containers (like Bun/Node apps) requires several gigabytes of temporary disk space. If a deployment fails due to disk space issues on small instances:

1. **Clear Docker Cache (Prune):** 
   You can delete dangling images and stopped containers to free up space:
   ```bash
   ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "docker system prune -af"
   ```

2. **Increase EBS Volume in AWS Console:**
   If pruning doesn't help, the EC2 instance's volume size needs to be increased:
   - Go to AWS Console > EC2 > Volumes.
   - Modify the instance's volume size (e.g., from 8GB to 30GB).
   - Once modified, you must force the Ubuntu OS to recognize the new space by running:
     ```bash
     ssh -i rslcardspem.pem -o StrictHostKeyChecking=no ubuntu@100.52.90.163 "sudo growpart /dev/nvme0n1 1 && sudo resize2fs /dev/root"
     ```
   - *Note: If your disk is not named `nvme0n1`, run `lsblk` via SSH to find the correct partition name.*

## 4. Automated CI/CD Deployment via GitHub Actions

An automated GitHub Actions workflow is set up at [`.github/workflows/deploy.yml`](file:///Users/vinay/RSL_Cards/RSL/.github/workflows/deploy.yml). Whenever code is pushed or merged into the `main` branch, GitHub Actions automatically:
1. Syncs the repository to your AWS EC2 instance.
2. Rebuilds and restarts the production Docker containers via `docker compose`.
3. Verifies container health.

### GitHub Repository Secrets Required

To enable the workflow, add the following secrets in GitHub (**Settings > Secrets and variables > Actions**):

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `EC2_SSH_KEY` | *(Contents of `rslcardspem.pem`)* | Private key used to SSH into the EC2 server |
| `EC2_HOST` | `100.52.90.163` | EC2 public IP or hostname |
| `EC2_USER` | `ubuntu` | EC2 SSH username |

