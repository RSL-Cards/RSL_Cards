#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/ecr-stack';
import { S3Stack } from '../lib/s3-stack';
import { RdsStack } from '../lib/rds-stack';
import { RedisStack } from '../lib/redis-stack';
import { SsmStack } from '../lib/ssm-stack';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();

// Production environment configuration (defaults to 'prod')
const environmentName = app.node.tryGetContext('env') || 'prod';
const awsRegion = process.env.CDK_DEFAULT_REGION || app.node.tryGetContext('region') || 'us-east-1';
const awsAccount = process.env.CDK_DEFAULT_ACCOUNT || app.node.tryGetContext('account');

const env: cdk.Environment = {
  account: awsAccount,
  region: awsRegion,
};

const stackPrefix = `rsl-${environmentName}`;

// 1. Networking Stack (VPC & Security Groups)
const vpcStack = new VpcStack(app, `${stackPrefix}-vpc`, {
  env,
  environmentName,
  description: 'Production VPC and Security Groups for RSL Cards Backend',
});

// 2. Container Registry Stack (ECR)
const ecrStack = new EcrStack(app, `${stackPrefix}-ecr`, {
  env,
  environmentName,
  description: 'Production Amazon ECR Repository for containerized backend images',
});

// 3. Storage Stack (S3)
const s3Stack = new S3Stack(app, `${stackPrefix}-s3`, {
  env,
  environmentName,
  description: 'Production Amazon S3 Bucket for application assets and file uploads',
});

// 4. Managed PostgreSQL Database Stack (RDS)
const rdsStack = new RdsStack(app, `${stackPrefix}-rds`, {
  env,
  environmentName,
  vpc: vpcStack.vpc,
  securityGroup: vpcStack.rdsSecurityGroup,
  description: 'Production Amazon RDS PostgreSQL database instance in private subnets',
});
rdsStack.addDependency(vpcStack);

// 5. Managed Redis Cluster Stack (ElastiCache)
const redisStack = new RedisStack(app, `${stackPrefix}-redis`, {
  env,
  environmentName,
  vpc: vpcStack.vpc,
  securityGroup: vpcStack.redisSecurityGroup,
  description: 'Production Amazon ElastiCache Redis cluster in private subnets',
});
redisStack.addDependency(vpcStack);

// 6. Systems Manager Parameter Store Stack (SSM)
const ssmStack = new SsmStack(app, `${stackPrefix}-ssm`, {
  env,
  environmentName,
  description: 'Production AWS Systems Manager Parameter Store for runtime secrets and configuration',
});

// 7. Amazon ECS Fargate Container Service Stack
const ecsStack = new EcsStack(app, `${stackPrefix}-ecs`, {
  env,
  environmentName,
  vpc: vpcStack.vpc,
  rdsSecurityGroup: vpcStack.rdsSecurityGroup,
  redisSecurityGroup: vpcStack.redisSecurityGroup,
  ecrRepository: ecrStack.repository,
  s3Bucket: s3Stack.bucket,
  description: 'Production Amazon ECS Fargate Load-Balanced Serverless Container Service',
});
ecsStack.addDependency(vpcStack);
ecsStack.addDependency(ecrStack);
ecsStack.addDependency(s3Stack);
ecsStack.addDependency(rdsStack);
ecsStack.addDependency(redisStack);
ecsStack.addDependency(ssmStack);

// Global resource tags for production tracking
cdk.Tags.of(app).add('Project', 'RSL-Cards');
cdk.Tags.of(app).add('Environment', environmentName);
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK');

app.synth();
