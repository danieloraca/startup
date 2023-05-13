const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
import { ulid } from 'ulid';

exports.handler = async (event) => {
    const name = event.name || '';
    const item = {
        "id": ulid(),
        "name": name
    };

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: item
    };

    const response = await ddb.put(params).promise();
    console.log('PutItem succeeded:', response);

    const responseBody = {
        statusCode: 200,
        body: JSON.stringify(item)
    };

    return responseBody;
}
