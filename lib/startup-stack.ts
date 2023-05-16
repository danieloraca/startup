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
      tableName: 'DynamoDan'
    });

    const getLambda = new nodejslambda.NodejsFunction(this, "GetLambdaDan", {
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

    const putLambda = new nodejslambda.NodejsFunction(this, "PutLambdaDan", {
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

    const deleteLambda = new lambda.Function(this, 'DeleteLambdaDan', {
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: {
        'TABLE_NAME': table.tableName,
      },
      handler: 'index.handler',
      code: lambda.Code.fromAsset('delete_lambda'),
      memorySize: 256,
    });
  
    table.grantReadData(getLambda);
    table.grantWriteData(putLambda);
    table.grantWriteData(deleteLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "ApiDan");

    // Define a new API Gateway resource for the "/item" endpoint
    const item = api.root.addResource("item");
    const itemById = item.addResource('{id}');

    // Define a request mapping template for the POST method
    const requestTemplate = {
      "application/json": {
        "name": "$input.json('$.name')"
      }
    };

    // Add the POST method to the "/item" resource and use the request mapping template
    item.addMethod(
      "POST",
      new apigateway.LambdaIntegration(putLambda),
      {
        requestTemplates: requestTemplate,
        methodResponses: [{
          statusCode: "200"
        }],
        proxy: true,
      }  as apigateway.MethodOptions
    );

    itemById.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteLambda, {
        proxy: true,
      }),
      {
        methodResponses: [{ statusCode: '204' }],
      } as apigateway.MethodOptions,
    );
    
    api.root.addMethod("GET", new apigateway.LambdaIntegration(getLambda));
    
    new cdk.CfnOutput(this, "Endpoint", {
      value: api.url!,
      description: "The API endpoint",
    });

  }
}
