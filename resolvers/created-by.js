import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return dynamoDBGetItemRequest({ id: ctx.source.creator });
}

export function response(ctx) {
  return ctx.result;
}

function dynamoDBGetItemRequest(key) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues(key),
  };
}