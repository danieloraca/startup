import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StartupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //dynamo table
    const table = new dynamodb.Table(this, 'DynamoDan', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'DynamoDanTable'
    });

    const getLambda = new nodejslambda.NodejsFunction(this, "GetLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: {
        'TABLE_NAME': table.tableName
      },
      handler: "index.handler",
      entry: "from_lambda/index.js",
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      }
    });

    const putLambda = new nodejslambda.NodejsFunction(this, "PutLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: {
        'TABLE_NAME': table.tableName
      },
      handler: "index.handler",
      entry: "to_lambda/index.js",
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      }
    });

    table.grantReadData(getLambda);
    table.grantWriteData(putLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "Api");

    api.root.addMethod("GET", new apigateway.LambdaIntegration(getLambda));
    api.root.addMethod("POST", new apigateway.LambdaIntegration(putLambda));
    
    new cdk.CfnOutput(this, "Endpoint", {
      value: api.url!,
      description: "The API endpoint",
    });

  }
}
