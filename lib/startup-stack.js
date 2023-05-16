"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupStack = void 0;
const cdk = require("aws-cdk-lib");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const lambda = require("aws-cdk-lib/aws-lambda");
const nodejslambda = require("aws-cdk-lib/aws-lambda-nodejs");
const apigateway = require("aws-cdk-lib/aws-apigateway");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
class StartupStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        item.addMethod("POST", new apigateway.LambdaIntegration(putLambda), {
            requestTemplates: requestTemplate,
            methodResponses: [{
                    statusCode: "200"
                }],
            proxy: true,
        });
        itemById.addMethod('DELETE', new apigateway.LambdaIntegration(deleteLambda, {
            proxy: true,
        }), {
            methodResponses: [{ statusCode: '204' }],
        });
        api.root.addMethod("GET", new apigateway.LambdaIntegration(getLambda));
        new cdk.CfnOutput(this, "Endpoint", {
            value: api.url,
            description: "The API endpoint",
        });
    }
}
exports.StartupStack = StartupStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0dXAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHFEQUFxRDtBQUNyRCxpREFBaUQ7QUFDakQsOERBQThEO0FBQzlELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFFOUMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixjQUFjO1FBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbEQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDakUsU0FBUyxFQUFFLFdBQVc7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxXQUFXLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLGVBQWU7WUFDeEIsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFO29CQUNmLFNBQVM7aUJBQ1Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUzthQUM5QjtZQUNELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsUUFBUSxFQUFFO2dCQUNSLGVBQWUsRUFBRTtvQkFDZixTQUFTO2lCQUNWO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ2hFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUzthQUM5QjtZQUNELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7WUFDNUMsVUFBVSxFQUFFLEdBQUc7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQixLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFbkMsY0FBYztRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFbkQsNkRBQTZEO1FBQzdELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFMUMsd0RBQXdEO1FBQ3hELE1BQU0sZUFBZSxHQUFHO1lBQ3RCLGtCQUFrQixFQUFFO2dCQUNsQixNQUFNLEVBQUUsdUJBQXVCO2FBQ2hDO1NBQ0YsQ0FBQztRQUVGLG1GQUFtRjtRQUNuRixJQUFJLENBQUMsU0FBUyxDQUNaLE1BQU0sRUFDTixJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFDM0M7WUFDRSxnQkFBZ0IsRUFBRSxlQUFlO1lBQ2pDLGVBQWUsRUFBRSxDQUFDO29CQUNoQixVQUFVLEVBQUUsS0FBSztpQkFDbEIsQ0FBQztZQUNGLEtBQUssRUFBRSxJQUFJO1NBQ2lCLENBQy9CLENBQUM7UUFFRixRQUFRLENBQUMsU0FBUyxDQUNoQixRQUFRLEVBQ1IsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxFQUNGO1lBQ0UsZUFBZSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDYixDQUM5QixDQUFDO1FBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFdkUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDbEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFJO1lBQ2YsV0FBVyxFQUFFLGtCQUFrQjtTQUNoQyxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUFqR0Qsb0NBaUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIG5vZGVqc2xhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5Jztcbi8vIGltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcblxuZXhwb3J0IGNsYXNzIFN0YXJ0dXBTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vZHluYW1vIHRhYmxlXG4gICAgY29uc3QgdGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0R5bmFtb0RhbicsIHtcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnaWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgdGFibGVOYW1lOiAnRHluYW1vRGFuJ1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2V0TGFtYmRhID0gbmV3IG5vZGVqc2xhbWJkYS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIkdldExhbWJkYURhblwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICdUQUJMRV9OQU1FJzogdGFibGUudGFibGVOYW1lXG4gICAgICB9LFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgICBlbnRyeTogXCJmcm9tX2xhbWJkYS9pbmRleC5qc1wiLFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXG4gICAgICAgICAgJ2F3cy1zZGsnXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHB1dExhbWJkYSA9IG5ldyBub2RlanNsYW1iZGEuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJQdXRMYW1iZGFEYW5cIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAnVEFCTEVfTkFNRSc6IHRhYmxlLnRhYmxlTmFtZVxuICAgICAgfSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgZW50cnk6IFwidG9fbGFtYmRhL2luZGV4LmpzXCIsXG4gICAgICBidW5kbGluZzoge1xuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFtcbiAgICAgICAgICAnYXdzLXNkaydcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgZGVsZXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRGVsZXRlTGFtYmRhRGFuJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAnVEFCTEVfTkFNRSc6IHRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2RlbGV0ZV9sYW1iZGEnKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICB9KTtcbiAgXG4gICAgdGFibGUuZ3JhbnRSZWFkRGF0YShnZXRMYW1iZGEpO1xuICAgIHRhYmxlLmdyYW50V3JpdGVEYXRhKHB1dExhbWJkYSk7XG4gICAgdGFibGUuZ3JhbnRXcml0ZURhdGEoZGVsZXRlTGFtYmRhKTtcblxuICAgIC8vIEFQSSBHYXRld2F5XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIkFwaURhblwiKTtcblxuICAgIC8vIERlZmluZSBhIG5ldyBBUEkgR2F0ZXdheSByZXNvdXJjZSBmb3IgdGhlIFwiL2l0ZW1cIiBlbmRwb2ludFxuICAgIGNvbnN0IGl0ZW0gPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcIml0ZW1cIik7XG4gICAgY29uc3QgaXRlbUJ5SWQgPSBpdGVtLmFkZFJlc291cmNlKCd7aWR9Jyk7XG5cbiAgICAvLyBEZWZpbmUgYSByZXF1ZXN0IG1hcHBpbmcgdGVtcGxhdGUgZm9yIHRoZSBQT1NUIG1ldGhvZFxuICAgIGNvbnN0IHJlcXVlc3RUZW1wbGF0ZSA9IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIiRpbnB1dC5qc29uKCckLm5hbWUnKVwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCB0aGUgUE9TVCBtZXRob2QgdG8gdGhlIFwiL2l0ZW1cIiByZXNvdXJjZSBhbmQgdXNlIHRoZSByZXF1ZXN0IG1hcHBpbmcgdGVtcGxhdGVcbiAgICBpdGVtLmFkZE1ldGhvZChcbiAgICAgIFwiUE9TVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHV0TGFtYmRhKSxcbiAgICAgIHtcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczogcmVxdWVzdFRlbXBsYXRlLFxuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFt7XG4gICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIlxuICAgICAgICB9XSxcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9ICBhcyBhcGlnYXRld2F5Lk1ldGhvZE9wdGlvbnNcbiAgICApO1xuXG4gICAgaXRlbUJ5SWQuYWRkTWV0aG9kKFxuICAgICAgJ0RFTEVURScsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihkZWxldGVMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbeyBzdGF0dXNDb2RlOiAnMjA0JyB9XSxcbiAgICAgIH0gYXMgYXBpZ2F0ZXdheS5NZXRob2RPcHRpb25zLFxuICAgICk7XG4gICAgXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldExhbWJkYSkpO1xuICAgIFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiRW5kcG9pbnRcIiwge1xuICAgICAgdmFsdWU6IGFwaS51cmwhLFxuICAgICAgZGVzY3JpcHRpb246IFwiVGhlIEFQSSBlbmRwb2ludFwiLFxuICAgIH0pO1xuXG4gIH1cbn1cbiJdfQ==