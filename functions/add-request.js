const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const ulid = require('ulid');

const { REQUESTS_TABLE, USERS_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { text } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const newRequest = {
    id,
    text,
    likes: 0,
    creator: username,
    createdAt: timestamp,
  };


  await DocumentClient.transactWrite({
    TransactItems:[{
      Put: {
        TableName: REQUESTS_TABLE,
        Item: newRequest,
        ConditionExpression: 'attribute_not_exists(id)'
      }
    },{
      Update: {
        TableName: USERS_TABLE,
        Key: {
          id: username
        },
        UpdateExpression: 'ADD requestsCount :one',
        ExpressionAttributeValues: {
          ':one': 1
        },
        ConditionExpression: 'attribute_exists(id)'
      }
    }]
  }).promise();

  return newRequest;
}