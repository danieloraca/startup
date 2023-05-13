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
        // Define a new API Gateway resource for the "/item" endpoint
        const item = api.root.addResource("item");
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
        });
        api.root.addMethod("GET", new apigateway.LambdaIntegration(getLambda));
        new cdk.CfnOutput(this, "Endpoint", {
            value: api.url,
            description: "The API endpoint",
        });
    }
}
exports.StartupStack = StartupStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0dXAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHFEQUFxRDtBQUNyRCxpREFBaUQ7QUFDakQsOERBQThEO0FBQzlELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFFOUMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixjQUFjO1FBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbEQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDakUsU0FBUyxFQUFFLGdCQUFnQjtTQUM1QixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVM7YUFDOUI7WUFDRCxPQUFPLEVBQUUsZUFBZTtZQUN4QixLQUFLLEVBQUUsc0JBQXNCO1lBQzdCLFFBQVEsRUFBRTtnQkFDUixlQUFlLEVBQUU7b0JBQ2YsU0FBUztpQkFDVjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbkUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxXQUFXLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLGVBQWU7WUFDeEIsS0FBSyxFQUFFLG9CQUFvQjtZQUMzQixRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFO29CQUNmLFNBQVM7aUJBQ1Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0IsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxjQUFjO1FBQ2QsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVoRCw2REFBNkQ7UUFDN0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFMUMsd0RBQXdEO1FBQ3hELE1BQU0sZUFBZSxHQUFHO1lBQ3RCLGtCQUFrQixFQUFFO2dCQUNsQixNQUFNLEVBQUUsdUJBQXVCO2FBQ2hDO1NBQ0YsQ0FBQztRQUVGLG1GQUFtRjtRQUNuRixJQUFJLENBQUMsU0FBUyxDQUNaLE1BQU0sRUFDTixJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFDM0M7WUFDRSxnQkFBZ0IsRUFBRSxlQUFlO1lBQ2pDLGVBQWUsRUFBRSxDQUFDO29CQUNoQixVQUFVLEVBQUUsS0FBSztpQkFDbEIsQ0FBQztTQUMwQixDQUMvQixDQUFDO1FBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFdkUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDbEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFJO1lBQ2YsV0FBVyxFQUFFLGtCQUFrQjtTQUNoQyxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUExRUQsb0NBMEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIG5vZGVqc2xhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5Jztcbi8vIGltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcblxuZXhwb3J0IGNsYXNzIFN0YXJ0dXBTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vZHluYW1vIHRhYmxlXG4gICAgY29uc3QgdGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0R5bmFtb0RhbicsIHtcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnaWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgdGFibGVOYW1lOiAnRHluYW1vRGFuVGFibGUnXG4gICAgfSk7XG5cbiAgICBjb25zdCBnZXRMYW1iZGEgPSBuZXcgbm9kZWpzbGFtYmRhLk5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiR2V0TGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1RBQkxFX05BTUUnOiB0YWJsZS50YWJsZU5hbWVcbiAgICAgIH0sXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgIGVudHJ5OiBcImZyb21fbGFtYmRhL2luZGV4LmpzXCIsXG4gICAgICBidW5kbGluZzoge1xuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFtcbiAgICAgICAgICAnYXdzLXNkaydcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcHV0TGFtYmRhID0gbmV3IG5vZGVqc2xhbWJkYS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIlB1dExhbWJkYVwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICdUQUJMRV9OQU1FJzogdGFibGUudGFibGVOYW1lXG4gICAgICB9LFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgICBlbnRyeTogXCJ0b19sYW1iZGEvaW5kZXguanNcIixcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogW1xuICAgICAgICAgICdhd3Mtc2RrJ1xuICAgICAgICBdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0YWJsZS5ncmFudFJlYWREYXRhKGdldExhbWJkYSk7XG4gICAgdGFibGUuZ3JhbnRXcml0ZURhdGEocHV0TGFtYmRhKTtcblxuICAgIC8vIEFQSSBHYXRld2F5XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIkFwaVwiKTtcblxuICAgIC8vIERlZmluZSBhIG5ldyBBUEkgR2F0ZXdheSByZXNvdXJjZSBmb3IgdGhlIFwiL2l0ZW1cIiBlbmRwb2ludFxuICAgIGNvbnN0IGl0ZW0gPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcIml0ZW1cIik7XG5cbiAgICAvLyBEZWZpbmUgYSByZXF1ZXN0IG1hcHBpbmcgdGVtcGxhdGUgZm9yIHRoZSBQT1NUIG1ldGhvZFxuICAgIGNvbnN0IHJlcXVlc3RUZW1wbGF0ZSA9IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIiRpbnB1dC5qc29uKCckLm5hbWUnKVwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCB0aGUgUE9TVCBtZXRob2QgdG8gdGhlIFwiL2l0ZW1cIiByZXNvdXJjZSBhbmQgdXNlIHRoZSByZXF1ZXN0IG1hcHBpbmcgdGVtcGxhdGVcbiAgICBpdGVtLmFkZE1ldGhvZChcbiAgICAgIFwiUE9TVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHV0TGFtYmRhKSxcbiAgICAgIHtcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczogcmVxdWVzdFRlbXBsYXRlLFxuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFt7XG4gICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIlxuICAgICAgICB9XSxcbiAgICAgIH0gIGFzIGFwaWdhdGV3YXkuTWV0aG9kT3B0aW9uc1xuICAgICk7XG5cbiAgICBhcGkucm9vdC5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0TGFtYmRhKSk7XG4gICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJFbmRwb2ludFwiLCB7XG4gICAgICB2YWx1ZTogYXBpLnVybCEsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgQVBJIGVuZHBvaW50XCIsXG4gICAgfSk7XG5cbiAgfVxufVxuIl19