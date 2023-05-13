const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const pageSize = 5;
    const pageNumber = event.pageNumber || 1;

    const params = {
        TableName: process.env.TABLE_NAME,
        Limit: pageSize,
        ExclusiveStartKey: event.lastEvaluatedKey,
    };

    const data = await ddb.scan(params).promise();
    console.log(data);

    const response = {
        statusCode: 200,
        body: JSON.stringify(data),
    };

    if (data.LastEvaluatedKey) {
        response.headers = {
            'last-evaluated-key': encodeURIComponent(JSON.stringify(data.LastEvaluatedKey)),
            'Access-Control-Expose-Headers': 'last-evaluated-key'
        }
    }

    return response;
}
