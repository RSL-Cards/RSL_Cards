import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface SsmStackProps extends cdk.StackProps {
  environmentName: string;
}

export class SsmStack extends cdk.Stack {
  public readonly parameters: Record<string, ssm.StringParameter> = {};

  constructor(scope: Construct, id: string, props: SsmStackProps) {
    super(scope, id, props);

    const { environmentName } = props;

    // Full environment configuration for SSM Parameter Store
    // DATABASE_URL, DATABASE_URL_READ_REPLICA, REDIS_URL, and S3_BUCKET_NAME are generated dynamically by RDS, Redis, and S3 stacks
    // NEVER put real secret values here: this file is in git. Secrets are created as placeholders and
    // their real values are set directly in SSM (aws ssm put-parameter --overwrite). CloudFormation only
    // rewrites a parameter when its value in this file changes, so hand-set values survive later deploys.
    const defaultEnvVars: Record<string, string> = {
      NODE_ENV: environmentName === 'prod' ? 'production' : 'development',
      LOG_LEVEL: environmentName === 'prod' ? 'warn' : 'debug',
      PORT: '8080',

      POSTGRES_USER: 'rsl_user',
      POSTGRES_PASSWORD: 'PLACEHOLDER_POSTGRES_PASSWORD',
      POSTGRES_DB: 'rslcards_prod',
      DB_POOL_MAX: '8', // up to 10 tasks x 8 stays under db.t4g.micro's ~85 connection limit

      JWT_PRIVATE_KEY: 'PLACEHOLDER_RSA_PRIVATE_KEY_CHANGE_IN_AWS_SSM',
      JWT_PUBLIC_KEY: 'PLACEHOLDER_RSA_PUBLIC_KEY_CHANGE_IN_AWS_SSM',
      INTERNAL_SERVICE_KEY: 'PLACEHOLDER_INTERNAL_SERVICE_KEY',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',

      // MySlabs API Keys
      MYSLABS_CLIENT_ID: 'AwzoUPZE8eNlWi8vtaOkXTPdCPcHGMkdZeLmoELL',
      MYSLABS_CLIENT_SECRET: 'PLACEHOLDER_MYSLABS_CLIENT_SECRET',

      // Google & Apple OAuth
      GOOGLE_CLIENT_ID: '156597264526-1m2tsk1gc5b1v4g05aqsa3fn2i1f5pr8.apps.googleusercontent.com',
      GOOGLE_IOS_CLIENT_ID: '156597264526-vuprt1vot9ku9nr1oos1llu5rnjv2iae.apps.googleusercontent.com',
      GOOGLE_ANDROID_CLIENT_ID: '156597264526-1cpp7kadv9ifvt708gi1qlfc8l727c1a.apps.googleusercontent.com',
      APPLE_CLIENT_ID: 'com.rslcards.web',
      APPLE_AUDIENCE: 'com.rslcards.dealer',
      APPLE_ISSUER: 'https://appleid.apple.com',

      // eBay Configuration
      EBAY_ENV: 'production',
      EBAY_MARKETPLACE_ID: 'EBAY_US',
      EBAY_DEV_ID: '1d1c82da-dce4-416d-b22e-e29a9b2f2609',

      EBAY_SANDBOX_CLIENT_ID: 'VinayGol-RSL-SBX-56c1164ac-f579488b',
      EBAY_SANDBOX_CLIENT_SECRET: 'PLACEHOLDER_EBAY_SANDBOX_CLIENT_SECRET',
      EBAY_SANDBOX_API_URL: 'https://api.sandbox.ebay.com',
      EBAY_SANDBOX_TOKEN_URL: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      EBAY_SANDBOX_AUTH_URL: 'https://auth.sandbox.ebay.com/oauth2/authorize',
      EBAY_SANDBOX_RU_NAME: 'Vinay_Golla-VinayGol-RSL-SB-oslzfy',

      EBAY_PROD_CLIENT_ID: 'VinayGol-RSL-PRD-26c1d3885-c948d8b2',
      EBAY_PROD_CLIENT_SECRET: 'PLACEHOLDER_EBAY_PROD_CLIENT_SECRET',
      EBAY_PROD_API_URL: 'https://api.ebay.com',
      EBAY_PROD_TOKEN_URL: 'https://api.ebay.com/identity/v1/oauth2/token',
      EBAY_PROD_AUTH_URL: 'https://auth.ebay.com/oauth2/authorize',
      EBAY_PROD_RU_NAME: 'Vinay_Golla-VinayGol-RSL-PR-vdownj',

      GEMINI_API_KEY: 'PLACEHOLDER_GEMINI_API_KEY',

      AWS_ACCESS_KEY_ID: 'PLACEHOLDER_AWS_ACCESS_KEY_ID',
      AWS_SECRET_ACCESS_KEY: 'PLACEHOLDER_AWS_SECRET_ACCESS_KEY',
      AWS_REGION: 'us-east-1',

      SOLD_COMPS_KEY: 'PLACEHOLDER_SOLD_COMPS_KEY',
      SPORTRADAR_ASSOCIATED_PRESS: 'PLACEHOLDER_SPORTRADAR_KEY',

      RESEND_API_KEY: 'PLACEHOLDER_RESEND_API_KEY',
      RESEND_DOMAIN: 'rslcardspro.com',
      RESEND_FROM_EMAIL: 'noreply@rslcardspro.com',
      RESEND_FROM_NAME: 'RSL Cards',
      APP_WEB_URL: 'https://rslcardspro.com',

      NEXT_PUBLIC_APPLE_CLIENT_ID: 'com.rslcards.web',
      NEXT_PUBLIC_APPLE_REDIRECT_URI: 'https://app.rslcards.com',

      ONESIGNAL_APP_ID: 'PLACEHOLDER_ONESIGNAL_APP_ID',
      ONESIGNAL_REST_API_KEY: 'PLACEHOLDER_ONESIGNAL_REST_API_KEY',
    };

    // Populate parameters into SSM Parameter Store under /rsl/{environmentName}/config/{KEY}
    for (const [key, value] of Object.entries(defaultEnvVars)) {
      const paramKey = key.toLowerCase();
      this.parameters[key] = new ssm.StringParameter(this, `Param_${key}`, {
        parameterName: `/rsl/${environmentName}/config/${paramKey}`,
        stringValue: value || 'placeholder',
        description: `Runtime SSM parameter for ${key}`,
      });
      // Keep the live parameter (and any value set by hand) if it is ever removed from this stack,
      // so secrets can later be taken out of CDK without CloudFormation deleting them.
      this.parameters[key].applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }

    cdk.Tags.of(this).add('Component', 'Configuration');
  }
}
