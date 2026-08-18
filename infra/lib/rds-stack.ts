import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface RdsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  environmentName: string;
  dbInstanceClass?: string;
}

export class RdsStack extends cdk.Stack {
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbUrlParameter: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup, environmentName } = props;

    // Configurable database instance size (defaults to db.t4g.micro)
    const instanceClassStr = props.dbInstanceClass ||
      this.node.tryGetContext('dbInstanceClass') ||
      't4g.micro';

    // 1. Auto-generate database master credentials in AWS Secrets Manager
    this.dbSecret = new rds.DatabaseSecret(this, 'RdsDatabaseMasterSecret', {
      username: 'rsl_admin',
      secretName: `/rsl/${environmentName}/database/credentials`,
    });

    // 2. Define RDS PostgreSQL Database Instance in Private Isolated Subnets
    this.dbInstance = new rds.DatabaseInstance(this, 'RdsPostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [securityGroup],
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        this.parseInstanceSize(instanceClassStr)
      ),
      allocatedStorage: 20,
      maxAllocatedStorage: 100, // Auto-scales storage up to 100GB
      databaseName: 'rsldb',
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      publiclyAccessible: false,
      backupRetention: cdk.Duration.days(environmentName === 'prod' ? 30 : 7),
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'Sun:04:30-Sun:05:30',
      storageEncrypted: true,
      deletionProtection: environmentName === 'prod',
      removalPolicy: environmentName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // 3. Construct and store the full DB connection string automatically in SSM Parameter Store
    // Format: postgresql://username:password@host:port/database
    const dbUrl = `postgresql://${this.dbSecret.secretValueFromJson('username').unsafeUnwrap()}:${this.dbSecret.secretValueFromJson('password').unsafeUnwrap()}@${this.dbInstance.dbInstanceEndpointAddress}:${this.dbInstance.dbInstanceEndpointPort}/rsldb`;

    this.dbUrlParameter = new ssm.StringParameter(this, 'DatabaseUrlParameter', {
      parameterName: `/rsl/${environmentName}/config/database_url`,
      stringValue: dbUrl,
      description: 'PostgreSQL primary database connection URL for Elysia/Drizzle ORM',
    });

    new ssm.StringParameter(this, 'DatabaseReadReplicaUrlParameter', {
      parameterName: `/rsl/${environmentName}/config/database_url_read_replica`,
      stringValue: dbUrl,
      description: 'PostgreSQL read replica connection URL for Elysia/Drizzle ORM',
    });

    cdk.Tags.of(this).add('Component', 'Database');

    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: this.dbInstance.dbInstanceEndpointAddress,
      description: 'Endpoint of the PostgreSQL RDS Database',
      exportName: `rsl-rds-endpoint-${environmentName}`,
    });
  }

  private parseInstanceSize(sizeStr: string): ec2.InstanceSize {
    if (sizeStr.endsWith('small')) return ec2.InstanceSize.SMALL;
    if (sizeStr.endsWith('medium')) return ec2.InstanceSize.MEDIUM;
    if (sizeStr.endsWith('large')) return ec2.InstanceSize.LARGE;
    return ec2.InstanceSize.MICRO;
  }
}
