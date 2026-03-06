import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

interface FrontendStackProps extends cdk.StackProps {
    backendUrl: string;
}

export class FrontendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        // 1. Storage bucket for the React Frontend
        const siteBucket = new s3.Bucket(this, 'TechStoreFrontendBucket', {
            bucketName: `techstore-frontend-${this.account}-${this.region}`,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // 2. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'TechStoreDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            // React Router handling (redirect 404 to index.html)
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                }
            ]
        });

        // 3. Deploy local build to the S3 bucket
        // Note: To deploy, frontend must be pre-built (npm run build)
        new s3deploy.BucketDeployment(this, 'DeployFrontendFiles', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/dist'))],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });

        // Outputs
        new cdk.CfnOutput(this, 'CloudFrontURL', {
            value: `https://${distribution.domainName}`,
            description: 'The URL of the Web Application running on CloudFront',
        });
    }
}
