# AWS ECS Fargate Infrastructure & Deployment Guide

This guide documents the serverless AWS ECS Fargate infrastructure architecture for **RSL Cards**, including deployment workflows, CDK stack specifications, and cost-optimization configurations.

---

## 🏗️ Architecture Overview

The backend is deployed as a serverless container on **Amazon ECS Fargate** (`rsl-cluster-prod` / `rsl-backend-prod`) behind an **AWS Application Load Balancer (ALB)** with HTTPS certificate termination.

### 🌐 VPC Networking & Security

```
[ Internet Traffic ]
       │
       ▼ (Port 443 / HTTPS)
[ Application Load Balancer (ALB) ]
       │
       ▼
[ ECS Fargate Container (Bun + Elysia) ] ────(Outbound APIs)────► [ Internet Gateway ]
  (Public Subnet - Port 8080)                                      (FREE Outbound Egress)
       │
       ▼ (Port 5432 / 6379 Private)
[ PostgreSQL RDS & ElastiCache Redis ]
  (Isolated Private Subnets)
```

1. **ECS Fargate Container**: Runs in the VPC Public Subnet with `assignPublicIp: true`. Outbound API calls (eBay, SoldComps, Google Vision) route directly through the VPC **Internet Gateway** (0 outbound NAT fees).
2. **PostgreSQL RDS & Redis**: Hosted inside **isolated private subnets** (`PRIVATE_ISOLATED`). They do not have public IP addresses and strictly accept connections originating from the `EcsTaskSecurityGroup`.

---

## ⚡ Cost Optimization & Sizing Specification

| Infrastructure Component | Specification | Daily Cost | Monthly Cost | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **ECS Fargate Task** | `0.25 vCPU` (256) / `512 MB RAM` | ~$0.12 / day | ~$3.60 / mo | Bun runtime consumes ~140-160MB RAM |
| **VPC NAT Gateway** | `natGateways: 0` (Bypassed) | $0.00 / day | $0.00 / mo | Saves $32.40/mo standing fee |
| **Application Load Balancer** | 1 ALB (HTTPS Port 443) | ~$0.23 / day | ~$6.90 / mo | Custom domain `api.rslcards.com` |
| **RDS PostgreSQL** | `db.t4g.micro` (20GB Storage) | ~$0.20 / day | ~$6.00 / mo | Single-AZ production DB |
| **ElastiCache Redis** | `cache.t4g.micro` | ~$0.16 / day | ~$4.80 / mo | BullMQ queues & caching |
| **CloudWatch Logs** | 14-Day Retention (`TWO_WEEKS`) | ~$0.10 / day | ~$3.00 / mo | Container Insights metrics disabled |
| **TOTAL** | | **~$0.81 / day** | **~$25.00 / mo** | **Supports 50-100 users/sec** |

---

## 🚀 Deployment Workflows

### 1. Automatic Deployment (GitHub Actions)
Pushing or merging code into the `main` branch automatically builds the Docker container, pushes to **Amazon ECR**, and updates the **ECS Fargate** task definition:
```bash
git add .
git commit -m "feat(module): add production update"
git push origin main
```

### 2. Manual ECS Service Update (AWS CLI)
To force a rolling deployment or update task definitions manually via AWS CLI:
```bash
# Force new deployment with latest container image
aws ecs update-service --cluster rsl-cluster-prod --service rsl-backend-prod --force-new-deployment --region us-east-1

# Check service deployment status
aws ecs describe-services --cluster rsl-cluster-prod --services rsl-backend-prod --region us-east-1
```

---

## 🛠️ CDK Infrastructure Code Reference

The AWS CDK infrastructure definitions are located in `infra/lib/`:

- [`infra/lib/ecs-stack.ts`](file:///Users/vinay/RSL_Cards/RSL/infra/lib/ecs-stack.ts): Fargate service task definition (`0.25 vCPU / 512 MB RAM`), ALB target group health check, and 14-day log retention.
- [`infra/lib/vpc-stack.ts`](file:///Users/vinay/RSL_Cards/RSL/infra/lib/vpc-stack.ts): VPC networking configuration (`maxAzs: 2`, `natGateways: 0`).
- [`infra/lib/rds-stack.ts`](file:///Users/vinay/RSL_Cards/RSL/infra/lib/rds-stack.ts): PostgreSQL database instance.
- [`infra/lib/redis-stack.ts`](file:///Users/vinay/RSL_Cards/RSL/infra/lib/redis-stack.ts): ElastiCache Redis cluster.

---

## 🧪 Health Verification

Check production API status and container resource utilization:
```bash
curl -i https://api.rslcards.com/health
```


