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
        api.root.addMethod("GET", new apigateway.LambdaIntegration(getLambda));
        api.root.addMethod("POST", new apigateway.LambdaIntegration(putLambda));
        new cdk.CfnOutput(this, "Endpoint", {
            value: api.url,
            description: "The API endpoint",
        });
    }
}
exports.StartupStack = StartupStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0dXAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHFEQUFxRDtBQUNyRCxpREFBaUQ7QUFDakQsOERBQThEO0FBQzlELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFFOUMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixjQUFjO1FBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbEQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDakUsU0FBUyxFQUFFLGdCQUFnQjtTQUM1QixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVM7YUFDOUI7WUFDRCxPQUFPLEVBQUUsZUFBZTtZQUN4QixLQUFLLEVBQUUsc0JBQXNCO1lBQzdCLFFBQVEsRUFBRTtnQkFDUixlQUFlLEVBQUU7b0JBQ2YsU0FBUztpQkFDVjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbkUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxXQUFXLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTO2FBQzlCO1lBQ0QsT0FBTyxFQUFFLGVBQWU7WUFDeEIsS0FBSyxFQUFFLG9CQUFvQjtZQUMzQixRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFO29CQUNmLFNBQVM7aUJBQ1Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0IsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxjQUFjO1FBQ2QsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVoRCxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUV4RSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNsQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUk7WUFDZixXQUFXLEVBQUUsa0JBQWtCO1NBQ2hDLENBQUMsQ0FBQztJQUVMLENBQUM7Q0FDRjtBQXJERCxvQ0FxREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbm9kZWpzbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuLy8gaW1wb3J0ICogYXMgc3FzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zcXMnO1xuXG5leHBvcnQgY2xhc3MgU3RhcnR1cFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy9keW5hbW8gdGFibGVcbiAgICBjb25zdCB0YWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnRHluYW1vRGFuJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdpZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB0YWJsZU5hbWU6ICdEeW5hbW9EYW5UYWJsZSdcbiAgICB9KTtcblxuICAgIGNvbnN0IGdldExhbWJkYSA9IG5ldyBub2RlanNsYW1iZGEuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRMYW1iZGFcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAnVEFCTEVfTkFNRSc6IHRhYmxlLnRhYmxlTmFtZVxuICAgICAgfSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgZW50cnk6IFwiZnJvbV9sYW1iZGEvaW5kZXguanNcIixcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogW1xuICAgICAgICAgICdhd3Mtc2RrJ1xuICAgICAgICBdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwdXRMYW1iZGEgPSBuZXcgbm9kZWpzbGFtYmRhLk5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiUHV0TGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1RBQkxFX05BTUUnOiB0YWJsZS50YWJsZU5hbWVcbiAgICAgIH0sXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgIGVudHJ5OiBcInRvX2xhbWJkYS9pbmRleC5qc1wiLFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXG4gICAgICAgICAgJ2F3cy1zZGsnXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRhYmxlLmdyYW50UmVhZERhdGEoZ2V0TGFtYmRhKTtcbiAgICB0YWJsZS5ncmFudFdyaXRlRGF0YShwdXRMYW1iZGEpO1xuXG4gICAgLy8gQVBJIEdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiQXBpXCIpO1xuXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldExhbWJkYSkpO1xuICAgIGFwaS5yb290LmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHV0TGFtYmRhKSk7XG4gICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJFbmRwb2ludFwiLCB7XG4gICAgICB2YWx1ZTogYXBpLnVybCEsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgQVBJIGVuZHBvaW50XCIsXG4gICAgfSk7XG5cbiAgfVxufVxuIl19