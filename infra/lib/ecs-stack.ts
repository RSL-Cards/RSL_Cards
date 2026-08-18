import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  rdsSecurityGroup: ec2.SecurityGroup;
  redisSecurityGroup: ec2.SecurityGroup;
  ecrRepository: ecr.Repository;
  s3Bucket: s3.Bucket;
  environmentName: string;
}

export class EcsStack extends cdk.Stack {
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const { vpc, rdsSecurityGroup, redisSecurityGroup, ecrRepository, s3Bucket, environmentName } = props;

    // 1. Create ECS Cluster inside VPC
    const cluster = new ecs.Cluster(this, 'RslEcsCluster', {
      vpc,
      clusterName: `rsl-cluster-${environmentName}`,
      containerInsights: true,
    });

    // 2. Create Security Group for ECS Fargate Tasks
    const taskSecurityGroup = new ec2.SecurityGroup(this, 'EcsTaskSecurityGroup', {
      vpc,
      securityGroupName: `rsl-ecs-task-sg-${environmentName}`,
      description: 'Security group for ECS Fargate backend task containers',
      allowAllOutbound: true,
    });

    // Ingress rules defined inside EcsStack (prevents cross-stack cyclic dependency)
    new ec2.CfnSecurityGroupIngress(this, 'RdsIngressFromEcsTask', {
      ipProtocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      groupId: rdsSecurityGroup.securityGroupId,
      sourceSecurityGroupId: taskSecurityGroup.securityGroupId,
    });

    new ec2.CfnSecurityGroupIngress(this, 'RedisIngressFromEcsTask', {
      ipProtocol: 'tcp',
      fromPort: 6379,
      toPort: 6379,
      groupId: redisSecurityGroup.securityGroupId,
      sourceSecurityGroupId: taskSecurityGroup.securityGroupId,
    });

    // 3. IAM Task Execution Role (Allows ECS agent to pull ECR image and fetch SSM secrets)
    const executionRole = new iam.Role(this, 'EcsExecutionRole', {
      roleName: `rsl-ecs-execution-role-${environmentName}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));
    ecrRepository.grantPull(executionRole);

    executionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters', 'ssm:GetParameter', 'ssm:GetParameterHistory', 'kms:Decrypt'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/rsl/${environmentName}/*`],
      })
    );

    // 4. IAM Task Role (Assumed by the running container app for S3 bucket access)
    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      roleName: `rsl-ecs-task-role-${environmentName}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    s3Bucket.grantReadWrite(taskRole);

    // 5. Dynamic SSM Parameter Secret Bindings matching user Parameter Store list
    const dynamicSecretKeys = [
      'POSTGRES_PASSWORD', 'DATABASE_URL', 'DATABASE_URL_READ_REPLICA', 'REDIS_URL',
      'JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY', 'INTERNAL_SERVICE_KEY',
      'EBAY_DEV_ID', 'EBAY_SANDBOX_CLIENT_ID', 'EBAY_SANDBOX_CLIENT_SECRET',
      'EBAY_PROD_CLIENT_ID', 'EBAY_PROD_CLIENT_SECRET', 'GEMINI_API_KEY',
      'GOOGLE_CLIENT_ID', 'GOOGLE_IOS_CLIENT_ID', 'GOOGLE_ANDROID_CLIENT_ID',
      'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
      'RESEND_API_KEY', 'ONESIGNAL_APP_ID', 'ONESIGNAL_REST_API_KEY',
      'SOLD_COMPS_KEY', 'SPORTRADAR_ASSOCIATED_PRESS',
      'MYSLABS_CLIENT_ID', 'MYSLABS_CLIENT_SECRET',
    ];

    const secrets: Record<string, ecs.Secret> = {};
    for (const key of dynamicSecretKeys) {
      const ssmParam = ssm.StringParameter.fromStringParameterName(
        this,
        `EcsSec_${key}`,
        `/rsl/${environmentName}/config/${key.toLowerCase()}`
      );
      secrets[key] = ecs.Secret.fromSsmParameter(ssmParam);
    }

    // Standard static environment variables matching user Parameter Store list
    const environment: Record<string, string> = {
      NODE_ENV: environmentName === 'prod' ? 'production' : 'development',
      LOG_LEVEL: environmentName === 'prod' ? 'warn' : 'debug',
      PORT: '8080',
      POSTGRES_USER: 'rsl_user',
      POSTGRES_DB: 'rslcards_prod',
      DB_POOL_MAX: '50',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
      EBAY_ENV: 'production',
      EBAY_MARKETPLACE_ID: 'EBAY_US',
      EBAY_PROD_API_URL: 'https://api.ebay.com',
      EBAY_PROD_AUTH_URL: 'https://auth.ebay.com/oauth2/authorize',
      EBAY_PROD_RU_NAME: 'Vinay_Golla-VinayGol-RSL-PR-vdownj',
      EBAY_PROD_TOKEN_URL: 'https://api.ebay.com/identity/v1/oauth2/token',
      EBAY_SANDBOX_API_URL: 'https://api.sandbox.ebay.com',
      EBAY_SANDBOX_AUTH_URL: 'https://auth.sandbox.ebay.com/oauth2/authorize',
      EBAY_SANDBOX_RU_NAME: 'Vinay_Golla-VinayGol-RSL-SB-oslzfy',
      EBAY_SANDBOX_TOKEN_URL: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      APPLE_AUDIENCE: 'com.rslcards.dealer',
      APPLE_CLIENT_ID: 'com.rslcards.web',
      APPLE_ISSUER: 'https://appleid.apple.com',
      AWS_REGION: this.region,
      S3_BUCKET_NAME: s3Bucket.bucketName,
      RESEND_DOMAIN: 'rslcardspro.com',
      RESEND_FROM_EMAIL: 'noreply@rslcardspro.com',
      RESEND_FROM_NAME: 'RSL Cards',
      APP_WEB_URL: 'https://api.rslcards.com',
      NEXT_PUBLIC_APPLE_CLIENT_ID: 'com.rslcards.web',
      NEXT_PUBLIC_APPLE_REDIRECT_URI: 'https://app.rslcards.com',
    };

    // Reference requested ACM Certificate for HTTPS (Port 443)
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'ApiCertificate',
      `arn:aws:acm:${this.region}:${this.account}:certificate/887d6a3a-2936-4dd3-be13-3964abaddce8`
    );

    // 6. Create Serverless Amazon ECS Fargate Service with Application Load Balancer
    this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'RslFargateService', {
      cluster,
      serviceName: `rsl-backend-${environmentName}`,
      cpu: 1024, // 1 vCPU
      memoryLimitMiB: 2048, // 2 GB RAM
      desiredCount: 1,
      publicLoadBalancer: true,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificate,
      securityGroups: [taskSecurityGroup],
      taskSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'),
        containerPort: 8080,
        executionRole,
        taskRole,
        environment,
        secrets,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'rsl-backend' }),
      },
    });

    // Configure ALB Target Group Health Check
    this.fargateService.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(15),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // Auto-Scaling (Scale from 1 to 10 instances based on CPU / Request count)
    const autoScale = this.fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: environmentName === 'prod' ? 10 : 3,
    });
    autoScale.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    cdk.Tags.of(this).add('Component', 'ECSBackend');

    new cdk.CfnOutput(this, 'LoadBalancerDnsName', {
      value: `https://api.rslcards.com`,
      description: 'Custom Domain URL for the ECS Backend',
      exportName: `rsl-backend-url-${environmentName}`,
    });
  }
}
