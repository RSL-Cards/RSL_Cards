# 🚀 RSL Cards - Comprehensive Deployment & Release Guide

A complete, step-by-step guide for deploying new features, database updates, backend microservices, web dashboard, and mobile app releases (iOS TestFlight & Android Google Play).

---

## 📋 Table of Contents
1. [Pre-Flight Verification & Quality Checklist](#1--pre-flight-verification--quality-checklist)
2. [Backend API & AWS ECS Deployment](#2--backend-api--aws-ecs-deployment)
3. [Database Migrations (PostgreSQL & Drizzle)](#3--database-migrations-postgresql--drizzle)
4. [Web Dashboard Deployment](#4--web-dashboard-deployment)
5. [iOS Mobile App Deployment (Apple TestFlight & App Store)](#5--ios-mobile-app-deployment-apple-testflight--app-store)
6. [Android Mobile App Deployment (Google Play Store .aab)](#6--android-mobile-app-deployment-google-play-store-aab)
7. [Rollback & Emergency Operations](#7--rollback--emergency-operations)

---

## 1. 🧪 Pre-Flight Verification & Quality Checklist

Before shipping any new feature to production, always run the automated pre-flight checks:

### A. Run Integration Test Suite
Ensure all 13 backend integration test suites pass 100%:
```bash
cd backend
bun test --sequence
```

### B. Type Check & Linting
Verify 0 TypeScript syntax or compilation errors across the monorepo:
```bash
# Backend type check
cd backend && bun tsc --noEmit

# Mobile app type check
cd apps/dealer-app && npx tsc --noEmit

# Web dashboard type check
cd apps/web-dashboard && npx tsc --noEmit
```

---

## 2. ⚡ Backend API & AWS ECS Deployment

The backend service is hosted on **AWS ECS Cluster** (`rsl-cluster-prod` / `rsl-backend-prod`) running serverless Fargate tasks right-sized at `0.25 vCPU` and `512 MB RAM` with direct Internet Gateway routing ($25/mo AWS cost).

### Option A: Automatic CI/CD Deployment (Recommended)
Pushing to the `main` branch automatically triggers the GitHub Actions AWS deployment pipeline:
```bash
git add .
git commit -m "feat(module): add new production feature"
git push origin main
```

### Option B: Manual AWS ECS Container Push
If you need to manually push a hotfix container to AWS ECR:
```bash
# 1. Authenticate Docker with AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Build & Tag Docker Image
docker build -t rsl-backend -f backend/Dockerfile .
docker tag rsl-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rsl-backend-prod:latest

# 3. Push to ECR & Force ECS Deployment
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rsl-backend-prod:latest
aws ecs update-service --cluster rsl-cluster-prod --service rsl-backend-prod --force-new-deployment --region us-east-1
```

---

## 3. 🗄️ Database Migrations (PostgreSQL & Drizzle)

When adding new database tables, columns, or relations:

### 1. Generate Schema Migration
```bash
cd packages/shared-db
npx drizzle-kit generate
```

### 2. Apply Migrations to Production & QA Databases
```bash
# Production DB Migration
DATABASE_URL="postgresql://<PROD_USER>:<PROD_PASS>@<PROD_RDS_HOST>:5432/rsldb" npx drizzle-kit push --config=drizzle.prod.config.ts

# Test DB Sync
DATABASE_URL="postgresql://rsl_user:password@127.0.0.1:5432/rsldb_test" npx drizzle-kit push --config=drizzle.test.config.ts
```

---

## 4. 🌐 Web Dashboard Deployment

The Next.js web dashboard (`apps/web-dashboard`) deploys automatically via AWS Amplify or Vercel on git push:

```bash
git push origin main
```

### Manual Production Build & Verification
```bash
cd apps/web-dashboard
bun run build
bun run start
```

---

## 5. 🍏 iOS Mobile App Deployment (Apple TestFlight & App Store)

Deploy new mobile app updates directly to **Apple TestFlight**:

### Step 1: Trigger EAS Cloud Build & Auto-Submit to TestFlight
```bash
cd apps/dealer-app
npx eas build -p ios -e production -s --non-interactive
```

### Step 2: Submit Existing Build to TestFlight (If Build Finished)
```bash
cd apps/dealer-app
npx eas submit -p ios --latest --non-interactive
```

### Step 3: Verify on App Store Connect
- Open [App Store Connect TestFlight Console](https://appstoreconnect.apple.com/apps/6796585607/testflight/ios).
- TestFlight processing takes ~5–10 minutes. Once completed, testers automatically receive push notifications.

---

## 6. 🤖 Android Mobile App Deployment (Google Play Store .aab)

Deploy new Android app releases to the **Google Play Console**:

### Step 1: Trigger Production Android EAS Cloud Build
```bash
cd apps/dealer-app
npx eas build -p android -e production --non-interactive
```

### Step 2: Download Release-Signed `.aab` Bundle
Once the EAS build finishes, download the production release-signed `.aab` file:
```bash
# Get download link from latest build
npx eas build:list -p android --limit=1 --json

# Download directly via curl
curl -L -o rsl-release-signed.aab "<BUILD_ARTIFACT_URL>"
```

### Step 3: Manual Upload to Google Play Console
1. Open [Google Play Console](https://play.google.com/console).
2. Select **RSL Cards Pro** (`com.rslcards.dealer`).
3. Go to **Testing** -> **Internal testing** (or **Production**) -> **Create new release**.
4. Drag & drop `rsl-release-signed.aab`.
5. Click **Save** -> **Review release** -> **Start rollout**.

---

## 7. 🚨 Rollback & Emergency Operations

### Backend Rollback
To immediately revert backend to the previous stable ECS task definition:
```bash
aws ecs update-service \
  --cluster rsl-cluster-prod \
  --service rsl-backend-prod \
  --task-definition rsl-backend-prod:<PREVIOUS_TASK_REVISION> \
  --region us-east-1
```

### Mobile App Emergency Update (Expo OTA Updates)
To publish instant Over-The-Air (OTA) bugfixes to users without app store review:
```bash
cd apps/dealer-app
npx eas update --auto
```

---
*Maintained by RSL Cards Core Development Team.*
