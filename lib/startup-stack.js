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
        table.grantFullAccess(deleteLambda);
        // table.grant(deleteLambda, 'dynamodb:PutItem');
        // table.grant(deleteLambda, 'dynamodb:DeleteItem');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0dXAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHFEQUFxRDtBQUNyRCxpREFBaUQ7QUFDakQsOERBQThEO0FBQzlELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFFOUMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixjQUFjO1FBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbEQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDakUsU0FBUyxFQUFFLFdBQVc7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxXQUFXLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLGVBQWU7WUFDeEIsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFO29CQUNmLFNBQVM7aUJBQ1Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUzthQUM5QjtZQUNELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsUUFBUSxFQUFFO2dCQUNSLGVBQWUsRUFBRTtvQkFDZixTQUFTO2lCQUNWO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ2hFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUzthQUM5QjtZQUNELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7WUFDNUMsVUFBVSxFQUFFLEdBQUc7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQixLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxpREFBaUQ7UUFDakQsb0RBQW9EO1FBR3BELGNBQWM7UUFDZCxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRW5ELDZEQUE2RDtRQUM3RCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLHdEQUF3RDtRQUN4RCxNQUFNLGVBQWUsR0FBRztZQUN0QixrQkFBa0IsRUFBRTtnQkFDbEIsTUFBTSxFQUFFLHVCQUF1QjthQUNoQztTQUNGLENBQUM7UUFFRixtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLFNBQVMsQ0FDWixNQUFNLEVBQ04sSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQzNDO1lBQ0UsZ0JBQWdCLEVBQUUsZUFBZTtZQUNqQyxlQUFlLEVBQUUsQ0FBQztvQkFDaEIsVUFBVSxFQUFFLEtBQUs7aUJBQ2xCLENBQUM7WUFDRixLQUFLLEVBQUUsSUFBSTtTQUNpQixDQUMvQixDQUFDO1FBRUYsUUFBUSxDQUFDLFNBQVMsQ0FDaEIsUUFBUSxFQUNSLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRTtZQUM3QyxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUMsRUFDRjtZQUNFLGVBQWUsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ2IsQ0FDOUIsQ0FBQztRQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXZFLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2xDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBSTtZQUNmLFdBQVcsRUFBRSxrQkFBa0I7U0FDaEMsQ0FBQyxDQUFDO0lBRUwsQ0FBQztDQUNGO0FBckdELG9DQXFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBub2RlanNsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG4vLyBpbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5cbmV4cG9ydCBjbGFzcyBTdGFydHVwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvL2R5bmFtbyB0YWJsZVxuICAgIGNvbnN0IHRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdEeW5hbW9EYW4nLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHRhYmxlTmFtZTogJ0R5bmFtb0RhbidcbiAgICB9KTtcblxuICAgIGNvbnN0IGdldExhbWJkYSA9IG5ldyBub2RlanNsYW1iZGEuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRMYW1iZGFEYW5cIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAnVEFCTEVfTkFNRSc6IHRhYmxlLnRhYmxlTmFtZVxuICAgICAgfSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgZW50cnk6IFwiZnJvbV9sYW1iZGEvaW5kZXguanNcIixcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogW1xuICAgICAgICAgICdhd3Mtc2RrJ1xuICAgICAgICBdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwdXRMYW1iZGEgPSBuZXcgbm9kZWpzbGFtYmRhLk5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiUHV0TGFtYmRhRGFuXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1RBQkxFX05BTUUnOiB0YWJsZS50YWJsZU5hbWVcbiAgICAgIH0sXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgIGVudHJ5OiBcInRvX2xhbWJkYS9pbmRleC5qc1wiLFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXG4gICAgICAgICAgJ2F3cy1zZGsnXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRlbGV0ZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbGV0ZUxhbWJkYURhbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1RBQkxFX05BTUUnOiB0YWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdkZWxldGVfbGFtYmRhJyksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgfSk7XG4gIFxuICAgIHRhYmxlLmdyYW50UmVhZERhdGEoZ2V0TGFtYmRhKTtcbiAgICB0YWJsZS5ncmFudFdyaXRlRGF0YShwdXRMYW1iZGEpO1xuICAgIHRhYmxlLmdyYW50V3JpdGVEYXRhKGRlbGV0ZUxhbWJkYSk7XG4gICAgdGFibGUuZ3JhbnRGdWxsQWNjZXNzKGRlbGV0ZUxhbWJkYSk7XG4gICAgLy8gdGFibGUuZ3JhbnQoZGVsZXRlTGFtYmRhLCAnZHluYW1vZGI6UHV0SXRlbScpO1xuICAgIC8vIHRhYmxlLmdyYW50KGRlbGV0ZUxhbWJkYSwgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nKTtcblxuXG4gICAgLy8gQVBJIEdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiQXBpRGFuXCIpO1xuXG4gICAgLy8gRGVmaW5lIGEgbmV3IEFQSSBHYXRld2F5IHJlc291cmNlIGZvciB0aGUgXCIvaXRlbVwiIGVuZHBvaW50XG4gICAgY29uc3QgaXRlbSA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiaXRlbVwiKTtcbiAgICBjb25zdCBpdGVtQnlJZCA9IGl0ZW0uYWRkUmVzb3VyY2UoJ3tpZH0nKTtcblxuICAgIC8vIERlZmluZSBhIHJlcXVlc3QgbWFwcGluZyB0ZW1wbGF0ZSBmb3IgdGhlIFBPU1QgbWV0aG9kXG4gICAgY29uc3QgcmVxdWVzdFRlbXBsYXRlID0ge1xuICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiJGlucHV0Lmpzb24oJyQubmFtZScpXCJcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQWRkIHRoZSBQT1NUIG1ldGhvZCB0byB0aGUgXCIvaXRlbVwiIHJlc291cmNlIGFuZCB1c2UgdGhlIHJlcXVlc3QgbWFwcGluZyB0ZW1wbGF0ZVxuICAgIGl0ZW0uYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwdXRMYW1iZGEpLFxuICAgICAge1xuICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiByZXF1ZXN0VGVtcGxhdGUsXG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW3tcbiAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiXG4gICAgICAgIH1dLFxuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0gIGFzIGFwaWdhdGV3YXkuTWV0aG9kT3B0aW9uc1xuICAgICk7XG5cbiAgICBpdGVtQnlJZC5hZGRNZXRob2QoXG4gICAgICAnREVMRVRFJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRlbGV0ZUxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFt7IHN0YXR1c0NvZGU6ICcyMDQnIH1dLFxuICAgICAgfSBhcyBhcGlnYXRld2F5Lk1ldGhvZE9wdGlvbnMsXG4gICAgKTtcbiAgICBcbiAgICBhcGkucm9vdC5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0TGFtYmRhKSk7XG4gICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJFbmRwb2ludFwiLCB7XG4gICAgICB2YWx1ZTogYXBpLnVybCEsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgQVBJIGVuZHBvaW50XCIsXG4gICAgfSk7XG5cbiAgfVxufVxuIl19