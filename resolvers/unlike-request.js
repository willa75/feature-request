import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return dynamoDBLikeTransactionRequest(ctx.identity.username, ctx.arguments.requestId);
}

export function response(ctx) {
  if( ctx.result.cancellationReasons ) {
    util.error('DynamoDB transaction error');
  }

  if( ctx.error !== null ) {
    util.error('Failed to execute DynamoDB transaction');
  }

  return true;
}

function dynamoDBLikeTransactionRequest(userId, requestId) {
  return {
    operation: 'TransactWriteItems',
    transactItems: [
      {
        table: '#REVIEWS_TABLE#',
        operation: 'DeleteItem',
        key: util.dynamodb.toMapValues({ userId: userId, requestId: requestId }),
        condition: {
          expression: 'attribute_exists(requestId)'
        }
      },
      {
        table: '#REQUESTS_TABLE#',
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues({ id: requestId }),
        update: {
          expression: 'ADD likes :one',
          expressionValues: {
            ':one': util.dynamodb.toNumber(-1)
          }
        },
        condition: {
          expression: 'attribute_exists(id)'
        }
      },
      {
        table: '#USERS_TABLE#',
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues({ id: userId }),
        update: {
          expression: 'ADD requestsLiked :one',
          expressionValues: {
            ':one': util.dynamodb.toNumber(-1)
          }
        },
        condition: {
          expression: 'attribute_exists(id)'
        }
      }
    ]
  };
}