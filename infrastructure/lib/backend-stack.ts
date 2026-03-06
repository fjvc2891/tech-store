import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

export class BackendStack extends cdk.Stack {
    public readonly loadBalancerDnsName: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. VPC Configuration
        const vpc = new ec2.Vpc(this, 'TechStoreVpc', {
            maxAzs: 2, // Default is all AZs in region
            natGateways: 1, // Minimize cost
        });

        // 2. PostgreSQL Database (RDS)
        const dbSecret = new secretsmanager.Secret(this, 'TechStoreDbCredentials', {
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'postgres' }),
                generateStringKey: 'password',
                excludeCharacters: '"@/\\',
            },
        });

        const database = new rds.DatabaseInstance(this, 'TechStoreDatabase', {
            engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
            vpc,
            credentials: rds.Credentials.fromSecret(dbSecret),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            allocatedStorage: 20,
            publiclyAccessible: false,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // 3. ECS Cluster
        const cluster = new ecs.Cluster(this, 'TechStoreCluster', { vpc });

        // 4. Application Load Balanced Fargate Service
        const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'TechStoreFargateService', {
            cluster,
            memoryLimitMiB: 1024,
            cpu: 512,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../../backend')), // Builds Dockerfile from backend
                containerPort: 3000,
                environment: {
                    NODE_ENV: 'production',
                    DATABASE_URL: `postgresql://${dbSecret.secretValueFromJson('username').unsafeUnwrap()}:${dbSecret.secretValueFromJson('password').unsafeUnwrap()}@${database.dbInstanceEndpointAddress}:${database.dbInstanceEndpointPort}/postgres`,
                    // Note: Wompi API keys should ideally come from Secrets Manager too, 
                    // injected here or fetched at runtime.
                    WMP_PUBLIC_KEY: process.env.WMP_PUBLIC_KEY || 'pub_test_XXXX',
                    WMP_PRIVATE_KEY: process.env.WMP_PRIVATE_KEY || 'prv_test_XXXX',
                    WMP_EVENTS_SECRET: process.env.WMP_EVENTS_SECRET || 'events_test_XXXX',
                },
            },
            publicLoadBalancer: true,
        });

        // Allow Fargate to connect to RDS
        database.connections.allowDefaultPortFrom(fargateService.service.connections);

        this.loadBalancerDnsName = fargateService.loadBalancer.loadBalancerDnsName;

        // Outputs
        new cdk.CfnOutput(this, 'ApiLoadBalancerDns', {
            value: `http://${this.loadBalancerDnsName}`,
            description: 'The DNS name of the Application Load Balancer for the backend API',
        });
    }
}
