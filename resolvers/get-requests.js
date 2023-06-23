import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const limit = ctx.arguments.limit || 25;
  if( limit > 25 ){
    util.error('Max limit is 25');
  }
  const nextToken = ctx.arguments.nextToken;
  return dynamoDBScanRequest(limit, nextToken);
}

export function response(ctx) {
  return {
    requests: ctx.result.items || [],
    nextToken: ctx.result.nextToken
  }
}

function dynamoDBScanRequest(limit, nextToken) {
  return {
    operation: 'Scan',
    limit: limit,
    nextToken: nextToken
  };
}