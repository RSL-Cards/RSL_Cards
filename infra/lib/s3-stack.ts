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
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // 2. Store bucket name in SSM Parameter Store
    this.bucketNameParameter = new ssm.StringParameter(this, 'S3BucketNameParameter', {
      parameterName: `/rsl/${environmentName}/config/s3_bucket_name`,
      stringValue: this.bucket.bucketName,
      description: 'S3 bucket name for backend file storage & uploads',
    });

    cdk.Tags.of(this).add('Component', 'Storage');

    new cdk.CfnOutput(this, 'BucketNameOutput', {
      value: this.bucket.bucketName,
      description: 'Name of the S3 assets bucket',
      exportName: `rsl-s3-bucket-${environmentName}`,
    });
  }
}
