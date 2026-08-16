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

    // Environment configuration placeholder values for SSM Parameter Store
    // RDS, Redis, and S3 parameters are created dynamically by their respective stacks
    // Sensitive production keys must be updated in AWS SSM Parameter Store directly
    const defaultEnvVars: Record<string, string> = {
      NODE_ENV: environmentName === 'prod' ? 'production' : 'development',
      LOG_LEVEL: environmentName === 'prod' ? 'warn' : 'debug',
      PORT: '8080',
      AUTH_SERVICE_PORT: '3000',
      USER_SERVICE_PORT: '3000',
      INVENTORY_SERVICE_PORT: '3000',
      TRANSACTION_SERVICE_PORT: '3000',
      LISTING_SERVICE_PORT: '3000',
      CARD_DB_SERVICE_PORT: '3000',
      AI_NARRATIVE_SERVICE_PORT: '3000',
      NOTIFICATION_SERVICE_PORT: '3000',
      ANALYTICS_SERVICE_PORT: '3000',
      ADMIN_SERVICE_PORT: '3000',

      POSTGRES_USER: 'rsl_user',
      POSTGRES_PASSWORD: 'PLACEHOLDER_POSTGRES_PASSWORD',
      POSTGRES_DB: 'rslcards_prod',
      DB_POOL_MAX: '50',

      JWT_PRIVATE_KEY: 'PLACEHOLDER_RSA_PRIVATE_KEY_CHANGE_IN_AWS_SSM',
      JWT_PUBLIC_KEY: 'PLACEHOLDER_RSA_PUBLIC_KEY_CHANGE_IN_AWS_SSM',
      INTERNAL_SERVICE_KEY: 'PLACEHOLDER_INTERNAL_SERVICE_KEY',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',

      EBAY_ENV: 'production',
      EBAY_MARKETPLACE_ID: 'EBAY_US',
      EBAY_DEV_ID: 'PLACEHOLDER_EBAY_DEV_ID',
      EBAY_SANDBOX_CLIENT_ID: 'PLACEHOLDER_EBAY_SANDBOX_CLIENT_ID',
      EBAY_SANDBOX_CLIENT_SECRET: 'PLACEHOLDER_EBAY_SANDBOX_CLIENT_SECRET',
      EBAY_SANDBOX_API_URL: 'https://api.sandbox.ebay.com',
      EBAY_SANDBOX_TOKEN_URL: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      EBAY_SANDBOX_AUTH_URL: 'https://auth.sandbox.ebay.com/oauth2/authorize',
      EBAY_SANDBOX_RU_NAME: 'PLACEHOLDER_EBAY_SANDBOX_RU_NAME',
      EBAY_PROD_CLIENT_ID: 'PLACEHOLDER_EBAY_PROD_CLIENT_ID',
      EBAY_PROD_CLIENT_SECRET: 'PLACEHOLDER_EBAY_PROD_CLIENT_SECRET',
      EBAY_PROD_API_URL: 'https://api.ebay.com',
      EBAY_PROD_TOKEN_URL: 'https://api.ebay.com/identity/v1/oauth2/token',
      EBAY_PROD_AUTH_URL: 'https://auth.ebay.com/oauth2/authorize',
      EBAY_PROD_RU_NAME: 'PLACEHOLDER_EBAY_PROD_RU_NAME',

      VERTEX_AI_PROJECT_ID: 'rsl-cards-prod',
      VERTEX_AI_LOCATION: 'global',
      GOOGLE_CLOUD_API_KEY: 'PLACEHOLDER_GOOGLE_CLOUD_API_KEY',
      GEMINI_API_KEY: 'PLACEHOLDER_GEMINI_API_KEY',

      GOOGLE_CLIENT_ID: 'PLACEHOLDER_GOOGLE_CLIENT_ID',
      GOOGLE_CLIENT_SECRET: 'PLACEHOLDER_GOOGLE_CLIENT_SECRET',
      GOOGLE_IOS_CLIENT_ID: 'PLACEHOLDER_GOOGLE_IOS_CLIENT_ID',
      GOOGLE_ANDROID_CLIENT_ID: 'PLACEHOLDER_GOOGLE_ANDROID_CLIENT_ID',

      APPLE_CLIENT_ID: 'com.rslcards.web',
      APPLE_AUDIENCE: 'com.rslcards.web',
      APPLE_ISSUER: 'https://appleid.apple.com',

      AWS_ACCESS_KEY_ID: 'PLACEHOLDER_AWS_ACCESS_KEY_ID',
      AWS_SECRET_ACCESS_KEY: 'PLACEHOLDER_AWS_SECRET_ACCESS_KEY',
      AWS_REGION: 'us-east-1',

      XIMILAR_API_KEY: 'PLACEHOLDER_XIMILAR_API_KEY',
      SOLD_COMPS_KEY: 'PLACEHOLDER_SOLD_COMPS_KEY',

      MYSLABS_CLIENT_ID: 'PLACEHOLDER_MYSLABS_CLIENT_ID',
      MYSLABS_CLIENT_SECRET: 'PLACEHOLDER_MYSLABS_CLIENT_SECRET',

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

    // Populate all parameters into SSM Parameter Store under /rsl/{environmentName}/config/{KEY}
    for (const [key, value] of Object.entries(defaultEnvVars)) {
      const paramKey = key.toLowerCase();
      this.parameters[key] = new ssm.StringParameter(this, `Param_${key}`, {
        parameterName: `/rsl/${environmentName}/config/${paramKey}`,
        stringValue: value || 'placeholder',
        description: `Runtime SSM parameter for ${key}`,
      });
    }

    cdk.Tags.of(this).add('Component', 'Configuration');
  }
}
