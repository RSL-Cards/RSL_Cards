import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface EcrStackProps extends cdk.StackProps {
  environmentName: string;
}

export class EcrStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    const { environmentName } = props;

    this.repository = new ecr.Repository(this, 'RslBackendRepository', {
      repositoryName: `rsl-backend-${environmentName}`,
      imageScanOnPush: true,
      encryption: ecr.RepositoryEncryption.AES_256,
      removalPolicy: environmentName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: environmentName !== 'prod',
      lifecycleRules: [
        {
          description: 'Expire untagged images after 14 days to optimize storage cost',
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: cdk.Duration.days(14),
        },
        {
          description: 'Keep a maximum of 20 tagged release images',
          tagStatus: ecr.TagStatus.ANY,
          maxImageCount: 20,
        },
      ],
    });

    cdk.Tags.of(this).add('Component', 'ContainerRegistry');

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'URI of the Amazon ECR repository for rsl-backend',
      exportName: `rsl-ecr-uri-${environmentName}`,
    });
  }
}
