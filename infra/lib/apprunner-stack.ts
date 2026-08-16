import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface AppRunnerStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  ecrRepository: ecr.Repository;
  s3Bucket: s3.Bucket;
  environmentName: string;
  imageTag?: string;
}

export class AppRunnerStack extends cdk.Stack {
  public readonly appRunnerService: apprunner.CfnService;
  public readonly vpcConnector: apprunner.CfnVpcConnector;
  public readonly autoScalingConfig: apprunner.CfnAutoScalingConfiguration;

  constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup, ecrRepository, s3Bucket, environmentName } = props;
    const imageTag = props.imageTag || 'latest';

    // 1. IAM Access Role: Allows App Runner to pull images from ECR & fetch SSM secrets
    const accessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      roleName: `rsl-apprunner-access-role-${environmentName}`,
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
    });

    // Grant ECR pull permissions
    ecrRepository.grantPull(accessRole);

    // Grant SSM parameter access for all parameters under /rsl/{environmentName}/*
    accessRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters', 'ssm:GetParameter', 'ssm:GetParameterHistory'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/rsl/${environmentName}/*`],
      })
    );

    // 2. IAM Instance Role: Assumed by the container running the Bun/Elysia backend app
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      roleName: `rsl-apprunner-instance-role-${environmentName}`,
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });

    // Grant S3 access permissions to backend container for asset storage
    s3Bucket.grantReadWrite(instanceRole);

    // 3. App Runner VPC Connector: Allows App Runner to route outbound traffic into private VPC subnets
    const privateSubnetIds = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    }).subnetIds;

    this.vpcConnector = new apprunner.CfnVpcConnector(this, 'AppRunnerVpcConnector', {
      vpcConnectorName: `rsl-vpc-connector-${environmentName}`,
      subnets: privateSubnetIds,
      securityGroups: [securityGroup.securityGroupId],
    });

    // 4. Auto Scaling Configuration (Min 1, Max 10 instances, 100 concurrent requests per instance)
    this.autoScalingConfig = new apprunner.CfnAutoScalingConfiguration(this, 'AppRunnerAutoScalingConfig', {
      autoScalingConfigurationName: `rsl-autoscaling-${environmentName}`,
      minSize: 1,
      maxSize: environmentName === 'prod' ? 10 : 3,
      maxConcurrency: 100,
    });

    // 5. Construct list of all SSM parameter secret bindings from .env.prod
    const allEnvKeys = [
      'NODE_ENV', 'LOG_LEVEL', 'PORT',
      'AUTH_SERVICE_PORT', 'USER_SERVICE_PORT', 'INVENTORY_SERVICE_PORT',
      'TRANSACTION_SERVICE_PORT', 'LISTING_SERVICE_PORT', 'CARD_DB_SERVICE_PORT',
      'AI_NARRATIVE_SERVICE_PORT', 'NOTIFICATION_SERVICE_PORT', 'ANALYTICS_SERVICE_PORT', 'ADMIN_SERVICE_PORT',
      'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB',
      'DATABASE_URL', 'DATABASE_URL_READ_REPLICA', 'REDIS_URL', 'S3_BUCKET_NAME', 'DB_POOL_MAX',
      'JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY', 'INTERNAL_SERVICE_KEY', 'JWT_ACCESS_EXPIRY', 'JWT_REFRESH_EXPIRY',
      'EBAY_ENV', 'EBAY_MARKETPLACE_ID', 'EBAY_DEV_ID',
      'EBAY_SANDBOX_CLIENT_ID', 'EBAY_SANDBOX_CLIENT_SECRET', 'EBAY_SANDBOX_API_URL',
      'EBAY_SANDBOX_TOKEN_URL', 'EBAY_SANDBOX_AUTH_URL', 'EBAY_SANDBOX_RU_NAME',
      'EBAY_PROD_CLIENT_ID', 'EBAY_PROD_CLIENT_SECRET', 'EBAY_PROD_API_URL',
      'EBAY_PROD_TOKEN_URL', 'EBAY_PROD_AUTH_URL', 'EBAY_PROD_RU_NAME',
      'VERTEX_AI_PROJECT_ID', 'VERTEX_AI_LOCATION', 'GOOGLE_CLOUD_API_KEY', 'GEMINI_API_KEY',
      'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_IOS_CLIENT_ID', 'GOOGLE_ANDROID_CLIENT_ID',
      'APPLE_CLIENT_ID', 'APPLE_AUDIENCE', 'APPLE_ISSUER',
      'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION',
      'XIMILAR_API_KEY', 'SOLD_COMPS_KEY',
      'MYSLABS_CLIENT_ID', 'MYSLABS_CLIENT_SECRET',
      'SPORTRADAR_ASSOCIATED_PRESS',
      'RESEND_API_KEY', 'RESEND_DOMAIN', 'RESEND_FROM_EMAIL', 'RESEND_FROM_NAME', 'APP_WEB_URL',
      'NEXT_PUBLIC_APPLE_CLIENT_ID', 'NEXT_PUBLIC_APPLE_REDIRECT_URI',
      'ONESIGNAL_APP_ID', 'ONESIGNAL_REST_API_KEY',
    ];

    const runtimeEnvironmentSecrets = allEnvKeys.map((key) => ({
      name: key,
      value: `arn:aws:ssm:${this.region}:${this.account}:parameter/rsl/${environmentName}/config/${key.toLowerCase()}`,
    }));

    // 6. Create App Runner Service
    this.appRunnerService = new apprunner.CfnService(this, 'RslBackendAppRunnerService', {
      serviceName: `rsl-backend-${environmentName}`,
      sourceConfiguration: {
        autoDeploymentsEnabled: true,
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageIdentifier: `${ecrRepository.repositoryUri}:${imageTag}`,
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentSecrets,
          },
        },
      },
      instanceConfiguration: {
        cpu: '1024', // 1 vCPU
        memory: '2048', // 2 GB RAM
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 3,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: this.vpcConnector.attrVpcConnectorArn,
        },
      },
      autoScalingConfigurationArn: this.autoScalingConfig.attrAutoScalingConfigurationArn,
    });

    cdk.Tags.of(this).add('Component', 'AppRunnerBackend');

    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `https://${this.appRunnerService.attrServiceUrl}`,
      description: 'Public HTTPS URL of the App Runner Backend Service',
      exportName: `rsl-backend-url-${environmentName}`,
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceArn', {
      value: this.appRunnerService.attrServiceArn,
      description: 'ARN of the App Runner Backend Service',
      exportName: `rsl-backend-arn-${environmentName}`,
    });
  }
}
