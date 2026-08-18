import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcStackProps extends cdk.StackProps {
  environmentName: string;
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;
  public readonly redisSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { environmentName } = props;

    // 1. Create VPC spanning 2 Availability Zones
    this.vpc = new ec2.Vpc(this, 'RslVpc', {
      vpcName: `rsl-vpc-${environmentName}`,
      maxAzs: 2,
      natGateways: 1, // Single NAT Gateway to optimize cost while allowing outbound Internet egress
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateWithEgress',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // 2. Security Group for RDS PostgreSQL Database
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: this.vpc,
      securityGroupName: `rsl-rds-sg-${environmentName}`,
      description: 'Security group for RDS PostgreSQL database',
      allowAllOutbound: false,
    });

    // 3. Security Group for ElastiCache Redis
    this.redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: this.vpc,
      securityGroupName: `rsl-redis-sg-${environmentName}`,
      description: 'Security group for ElastiCache Redis cluster',
      allowAllOutbound: false,
    });

    // Tag all networking resources
    cdk.Tags.of(this).add('Component', 'Networking');
  }
}
