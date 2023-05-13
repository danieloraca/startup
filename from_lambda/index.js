const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const params = {
        TableName: process.env.TABLE_NAME,
    }

    console.log(event);

    const data = await ddb.scan(params).promise();
    const item = data.Items[Math.floor(Math.random() * data.Items.length)];
    const response = {
        statusCode: 200,
        body: JSON.stringify(item),
    };

    return response;
}
