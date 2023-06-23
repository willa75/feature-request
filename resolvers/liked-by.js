import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return dynamoDBGetItemRequest({ requestId: ctx.source.id, userId: ctx.identity.username });
}

export function response(ctx) {
  if( ctx.result === null ) {
    return false
  }

  return true;
}

function dynamoDBGetItemRequest(key) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues(key),
  };
}