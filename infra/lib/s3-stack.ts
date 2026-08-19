import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface S3StackProps extends cdk.StackProps {
  environmentName: string;
}

export class S3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly bucketNameParameter: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const { environmentName } = props;

    // 1. S3 Bucket definition
    this.bucket = new s3.Bucket(this, 'RslAssetsBucket', {
      bucketName: `rsl-assets-${environmentName}-${this.account}-${this.region}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: environmentName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environmentName !== 'prod',
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // 2. Automatically store all S3 environment variables in AWS SSM Parameter Store
    this.bucketNameParameter = new ssm.StringParameter(this, 'S3BucketNameParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_name`,
      stringValue: this.bucket.bucketName,
      description: 'S3 bucket name for backend file storage & uploads',
    });

    new ssm.StringParameter(this, 'S3BucketArnParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_arn`,
      stringValue: this.bucket.bucketArn,
      description: 'S3 bucket ARN for IAM & storage operations',
    });

    new ssm.StringParameter(this, 'S3BucketRegionParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_region`,
      stringValue: this.region,
      description: 'AWS Region for S3 bucket storage',
    });

    new ssm.StringParameter(this, 'S3BucketDomainNameParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_domain_name`,
      stringValue: this.bucket.bucketDomainName,
      description: 'S3 bucket regional domain name',
    });

    new ssm.StringParameter(this, 'S3BucketUrlParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_url`,
      stringValue: `https://${this.bucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'Base HTTPS URL for S3 bucket public assets',
    });

    cdk.Tags.of(this).add('Component', 'Storage');

    // 3. CloudFormation Outputs
    new cdk.CfnOutput(this, 'BucketNameOutput', {
      value: this.bucket.bucketName,
      description: 'Name of the S3 assets bucket',
      exportName: `rsl-s3-bucket-${environmentName}`,
    });

    new cdk.CfnOutput(this, 'BucketArnOutput', {
      value: this.bucket.bucketArn,
      description: 'ARN of the S3 assets bucket',
      exportName: `rsl-s3-bucket-arn-${environmentName}`,
    });

    new cdk.CfnOutput(this, 'BucketUrlOutput', {
      value: `https://${this.bucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'Public URL endpoint of the S3 bucket',
      exportName: `rsl-s3-bucket-url-${environmentName}`,
    });
  }
}
