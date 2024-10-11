import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_s3_deployment} from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkCfOacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // WebSite用Bucketの作成
    const websiteBucket = new cdk.aws_s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cdk.aws_cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        //origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        origin: cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(websiteBucket)
      }
    });

    // CloudFront DistributionのURLを出力
    new cdk.CfnOutput(this, 'DistributionURL', {
      value: distribution.distributionDomainName,
    });

    // S3 Bucketへコンテンツのアップロード
    new aws_s3_deployment.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [
          aws_s3_deployment.Source.data(
              '/index.html',
              '<html><body><h1>Hello, CDK!</h1></body></html>'
          ),
          aws_s3_deployment.Source.data(
              '/favicon.ico', ''
          ),
      ],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
  }
}
