# RSL Cards Production AWS Infrastructure (AWS CDK) 🚀

This documentation covers the complete, production-ready AWS Infrastructure as Code (IaC) for **RSL Cards** built with **AWS CDK (TypeScript)**.

The infrastructure provisions a containerized **Bun + Elysia** production backend running on **AWS App Runner**, backed by **Amazon RDS PostgreSQL**, **Amazon ElastiCache Redis**, **Amazon S3**, and **AWS Systems Manager (SSM) Parameter Store**.

---

## 🏗️ Production Architecture Overview

```
                                  +-------------------------------------------------+
                                  |                 AWS Cloud                       |
                                  |                (us-east-1)                      |
                                  |                                                 |
+-------------------+             |  +-------------------------------------------+  |
|  GitHub Actions   |--(OIDC Auth)|->|  Amazon ECR                                  |  |
|  (CI/CD Pipeline) |             |  |  (rsl-backend-prod)                          |  |
+-------------------+             |  +-------------------+-----------------------+  |
                                  |                      |                          |
                                  |                      v (Image Pull)             |
                                  |  +-------------------------------------------+  |
                                  |  |  AWS App Runner                           |  |
                                  |  |  (rsl-backend-prod)                      |  |
                                  |  |  - Auto-scaling (1-10 instances)           |  |
                                  |  |  - SSE / Long-lived connection support    |  |
                                  |  |  - Health check: /health on port 8080      |  |
                                  |  +-------------------+-----------------------+  |
                                  |                      |                          |
                                  |            (VPC Ingress Connector)              |
                                  |                      |                          |
                                  |                      v                          |
                                  |  +-------------------------------------------+  |
                                  |  |  VPC (Private Subnets)                    |  |
                                  |  |                                           |  |
                                  |  |  +------------------+ +-----------------+ |  |
                                  |  |  | Amazon RDS       | | ElastiCache     | |  |
                                  |  |  | PostgreSQL 16    | | Redis 7         | |  |
                                  |  |  +------------------+ +-----------------+ |  |
                                  |  +-------------------------------------------+  |
                                  |                                                 |
                                  |  +------------------+ +----------------------+  |
                                  |  | Amazon S3        | | SSM Parameter Store  |  |
                                  |  | (Assets Bucket)  | | (Runtime Config)     |  |
                                  |  +------------------+ +----------------------+  |
                                  +-------------------------------------------------+
```

---

## 📋 Complete Production Deployment Checklist

Follow these 6 steps to deploy and configure the entire production environment in AWS:

### Step 1: Configure AWS CLI on Your Computer
Ensure AWS CLI is logged into your AWS Account in region `us-east-1`:
```bash
aws configure
# AWS Region: us-east-1
```

### Step 2: Bootstrap AWS CDK (One-Time Command)
From the root of the repo:
```bash
cd infra
npm install
npx cdk bootstrap aws://<YOUR_AWS_ACCOUNT_ID>/us-east-1
```

### Step 3: Deploy Production CDK Stacks
Deploy all 7 production stacks (`rsl-prod-vpc`, `rsl-prod-ecr`, `rsl-prod-s3`, `rsl-prod-rds`, `rsl-prod-redis`, `rsl-prod-ssm`, `rsl-prod-apprunner`):
```bash
cd infra
npx cdk deploy --all
```

---

## 🔐 Step 4: Configure Production Keys in AWS SSM Parameter Store

Go to **AWS Console → Systems Manager → Parameter Store** (Region: `us-east-1`).

The following parameters under `/rsl/prod/config/*` are initialized with defaults. Update any parameters with your production third-party keys:

| Parameter Path in SSM | Purpose / Action Required |
| :--- | :--- |
| `/rsl/prod/config/jwt_private_key` | Production RSA Private Key for JWT signing |
| `/rsl/prod/config/jwt_public_key` | Production RSA Public Key for JWT verification |
| `/rsl/prod/config/internal_service_key` | Production Internal Service Secret Key |
| `/rsl/prod/config/ebay_prod_client_id` | Production eBay App Client ID |
| `/rsl/prod/config/ebay_prod_client_secret` | Production eBay App Client Secret |
| `/rsl/prod/config/ebay_prod_ru_name` | Production eBay Redirect Name |
| `/rsl/prod/config/gemini_api_key` | Production Gemini AI API Key |
| `/rsl/prod/config/google_client_id` | Production Google OAuth Client ID |
| `/rsl/prod/config/google_client_secret` | Production Google OAuth Client Secret |
| `/rsl/prod/config/ximilar_api_key` | Production Ximilar AI Card Scanning API Key |
| `/rsl/prod/config/resend_api_key` | Production Resend Transactional Email API Key |
| `/rsl/prod/config/onesignal_app_id` | Production OneSignal App ID |
| `/rsl/prod/config/onesignal_rest_api_key` | Production OneSignal REST API Key |

> [!IMPORTANT]
> `DATABASE_URL`, `DATABASE_URL_READ_REPLICA`, `REDIS_URL`, and `S3_BUCKET_NAME` are generated and bound to App Runner **automatically by CDK**. You do not need to enter them manually.

#### Command to Update Any SSM Parameter via AWS CLI:
```bash
aws ssm put-parameter \
  --name "/rsl/prod/config/resend_api_key" \
  --value "re_YOUR_PRODUCTION_KEY" \
  --type "SecureString" \
  --overwrite
```

---

## 🔑 Step 5: Configure GitHub Actions OIDC Authentication

To enable passwordless, secure deployment from GitHub Actions to AWS:

### 1. Create OIDC Provider in AWS IAM
- Navigate to **AWS IAM Console → Identity providers → Add provider**.
- **Provider Type**: OpenID Connect
- **Provider URL**: `https://token.actions.githubusercontent.com`
- **Audience**: `sts.amazonaws.com`

### 2. Create IAM Role for GitHub Actions
Create an IAM Role named `github-actions-rsl-deploy-role` with the following **Trust Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG_OR_USERNAME/RSL:*"
        }
      }
    }
  ]
}
```

### 3. Attach Permissions
Attach policies to `github-actions-rsl-deploy-role`:
* `AmazonEC2ContainerRegistryPowerUser`
* App Runner Inline Policy:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "apprunner:StartDeployment",
          "apprunner:ListServices",
          "apprunner:DescribeService"
        ],
        "Resource": "*"
      }
    ]
  }
  ```

### 4. Add Secret to GitHub Repository
Go to **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**:
* **Name**: `AWS_OIDC_ROLE_ARN`
* **Value**: `arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:role/github-actions-rsl-deploy-role`

---

## 🚀 Step 6: Initial Production Docker Build & Deployment

To build and deploy the production container image for the first time:

```bash
# 1. Log Docker into AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Build Production Docker image from repository root
docker build -f backend/Dockerfile -t rsl-backend-prod .

# 3. Tag image for Production ECR repository
docker tag rsl-backend-prod:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rsl-backend-prod:latest

# 4. Push image to ECR
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rsl-backend-prod:latest

# 5. Trigger App Runner Production Deployment
SERVICE_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='rsl-backend-prod'].ServiceArn" --output text)
aws apprunner start-deployment --service-arn "$SERVICE_ARN"
```

Once complete, any future push to the `main` branch automatically builds and deploys to AWS App Runner via GitHub Actions!

---

## 🛠️ CLI Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Synthesize Stacks** | `cdk synth` |
| **Deploy Stacks** | `cdk deploy --all` |
| **Destroy Stacks** | `cdk destroy --all` |
| **Trigger App Runner Deploy** | `aws apprunner start-deployment --service-arn <SERVICE_ARN>` |
