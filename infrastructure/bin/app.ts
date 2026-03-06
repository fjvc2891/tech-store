#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION || 'us-east-1' };

const backendStack = new BackendStack(app, 'TechStoreBackendStack', { env });

new FrontendStack(app, 'TechStoreFrontendStack', {
    env,
    backendUrl: backendStack.loadBalancerDnsName
});
