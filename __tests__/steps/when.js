require('isomorphic-fetch');
const gql = require('graphql-tag');
const { AWSAppSyncClient, AUTH_TYPE } = require('aws-appsync');

const appSyncConfig = (user) => ({
  url: process.env.ApiUrl,
  region: process.env.AwsRegion,
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: () => `Bearer ${user.idToken}`
  },
  disableOffline: true
});

const initAppSyncClient = (user) => {
  const config = appSyncConfig(user);
  return new AWSAppSyncClient(config);
};

const we_invoke_add_request = async (username, text) => {
  const handler = require('../../functions/add-request').handler;

  const context = {};
  const event = {
    identity: {
      username
    },
    arguments: {
      text    
    }
  };

  return await handler(event, context);
};

const we_invoke_confirmUserSignup = async (username, name, email) => {
  const handler = require('../../functions/confirm-user-signup').handler;

  const context = {};
  const event = {
    "version": "1",
    "region": process.env.AwsRegion,
    "userPoolId": process.env.CognitoUserPoolId,
    "userName": username,
    "triggerSource": "PostConfirmation_ConfirmSignUp",
    "request": {
      "userAttributes": {
        "sub": username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        "email_verified": "false",
        "name": name,
        "email": email
      }
    },
    "response": {}
  };

  return await handler(event, context);
};

const a_user_calls_getRequests = async (user, limit, nextToken) => {
  const client = initAppSyncClient(user);
  const resp = await client.query({
    query: gql`query getRequests($limit: Int!, $nextToken: String) {
      getRequests(limit: $limit, nextToken: $nextToken) {
        nextToken
        requests {
          id
          likes
          createdAt
          text
        }
      }
    }`,
    variables: {
      limit,
      nextToken
    }
  });

  const requests = resp.data.getRequests;

  console.log(`[${user.username}] - fetched requests`);

  return requests;
};

const a_user_calls_addRequest = async (user, text) => {
  const client = initAppSyncClient(user);
  const resp = await client.mutate({
    mutation: gql`mutation addRequest($text: String!) {
      addRequest(text: $text) {
        id
        createdAt
        text
        createdBy {
          id
          name
          screenName
          requestsCount
        }
      }
    }`,
    variables: {
      text
    }
  });

  const newRequest = resp.data.addRequest;

  console.log(`[${user.username}] - posted new addRequest`);

  return newRequest;
};

const a_user_likes_a_request = async (user, requestId) => {
  const client = initAppSyncClient(user);
  const resp = await client.mutate({
    mutation: gql`mutation like($requestId: ID!) {
      like(requestId: $requestId)
    }`,
    variables: {
      requestId
    }
  });

  const likeResp = resp.data.like;

  console.log(`[${user.username}] - like request [${requestId}]`);

  return likeResp;
};

const a_user_unlikes_a_request = async (user, requestId) => {
  const client = initAppSyncClient(user);
  const resp = await client.mutate({
    mutation: gql`mutation unlike($requestId: ID!) {
      unlike(requestId: $requestId)
    }`,
    variables: {
      requestId
    }
  });

  const likeResp = resp.data.unlike;

  console.log(`[${user.username}] - like request [${requestId}]`);

  return likeResp;
};

module.exports = {
  we_invoke_add_request,
  we_invoke_confirmUserSignup,
  a_user_calls_getRequests,
  a_user_calls_addRequest,
  a_user_likes_a_request,
  a_user_unlikes_a_request
};