import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface RedisStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  environmentName: string;
  cacheNodeType?: string;
}

export class RedisStack extends cdk.Stack {
  public readonly cacheCluster: elasticache.CfnCacheCluster;
  public readonly redisUrlParameter: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: RedisStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup, environmentName } = props;

    const cacheNodeType = props.cacheNodeType ||
      this.node.tryGetContext('redisNodeType') ||
      'cache.t4g.micro';

    // 1. Create Subnet Group in Private Isolated Subnets
    const isolatedSubnetIds = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    }).subnetIds;

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: `Subnet group for RSL ElastiCache Redis cluster (${environmentName})`,
      subnetIds: isolatedSubnetIds,
      cacheSubnetGroupName: `rsl-redis-subnet-group-${environmentName}`,
    });

    // 2. Create ElastiCache Redis Cluster
    this.cacheCluster = new elasticache.CfnCacheCluster(this, 'RedisCacheCluster', {
      clusterName: `rsl-redis-${environmentName}`,
      engine: 'redis',
      engineVersion: '7.0',
      cacheNodeType,
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
      vpcSecurityGroupIds: [securityGroup.securityGroupId],
      autoMinorVersionUpgrade: true,
    });

    this.cacheCluster.addDependsOn(subnetGroup);

    // 3. Store Redis Endpoint URL in SSM Parameter Store
    // Format: redis://host:6379
    const redisEndpoint = `redis://${this.cacheCluster.attrRedisEndpointAddress}:${this.cacheCluster.attrRedisEndpointPort}`;

    this.redisUrlParameter = new ssm.StringParameter(this, 'RedisUrlParameter', {
      parameterName: `/rsl/${environmentName}/config/redis_url`,
      stringValue: redisEndpoint,
      description: 'ElastiCache Redis endpoint URL for caching and task queues',
    });

    cdk.Tags.of(this).add('Component', 'Cache');

    new cdk.CfnOutput(this, 'RedisEndpointOutput', {
      value: redisEndpoint,
      description: 'Connection URL for ElastiCache Redis Cluster',
      exportName: `rsl-redis-url-${environmentName}`,
    });
  }
}
