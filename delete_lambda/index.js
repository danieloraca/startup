const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  try {
    // Retrieve the record ID from the request
    const recordId = body.id;
    console.log('recordId: ', recordId);

    // Delete the record from DynamoDB
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        id: recordId,
      },
    };
    const result = await dynamodb
      .delete(params)
      .promise()
      .then(console.log("Done deleting"));

    console.log('result: ', result);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Record deleted successfully' }),
    };
  } catch (error) {
    console.error('An error occurred while deleting the record:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while deleting the record' }),
    };
  }
};
