    const AWS = require('aws-sdk');
    const ddb = new AWS.DynamoDB.DocumentClient();
    import { ulid } from 'ulid';

    exports.handler = async (event) => {
        const body = JSON.parse(event.body);
        
        const item = {
            "id": ulid(),
            "name": body.name,
            "blah": body.blah || 'blah',
        };

        const params = {
            TableName: process.env.TABLE_NAME,
            Item: item
        };

        await ddb.put(params).promise();

        const responseBody = {
            statusCode: 200,
            body: JSON.stringify(item)
        };

        return responseBody;
    }
