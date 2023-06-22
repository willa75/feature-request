const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

const user_exists_in_UsersTable = async (id) => {
  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
  const resp = await DynamoDB.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id
    }
  }).promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const request_exists_in_RequestsTable = async (id) => {
  console.log(`looking for request [${id}] in table [${process.env.REQUESTS_TABLE}]`);
  const resp = await DynamoDB.get({
    TableName: process.env.REQUESTS_TABLE,
    Key: {
      id
    }
  }).promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const requestCount_is_updated_in_UsersTable = async (id, newCount) => {
  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
  const resp = await DynamoDB.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id
    }
  }).promise();

  expect(resp.Item).toBeTruthy();
  expect(resp.Item.requestsCount).toEqual(newCount);

  return resp.Item;
};

module.exports = {
  user_exists_in_UsersTable,
  request_exists_in_RequestsTable,
  requestCount_is_updated_in_UsersTable
}