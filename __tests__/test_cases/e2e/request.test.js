require('../../steps/init');
const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('Given an authenticated user', () => {
  let user;
  beforeAll( async () => {
    user = await given.an_authenticated_user();
  });

  describe('When they submit a feature request', () => {
    let request;
    const text = chance.string({ length: 250 });
    beforeAll( async () => {
      request = await when.a_user_calls_addRequest(user, text);
    });

    it('should return the new request', () => {
      expect(request).toMatchObject({
        text: request.text
      });
    });

    describe('When they call getRequests', () => {
      let requests, nextToken;
      beforeAll(async () => {
        const result = await when.a_user_calls_getRequests(user.username, 25);
        requests = result.requests;
        nextToken = result.nextToken;
      });

      it('They will see the new request in the requests array', async () => {
        expect(nextToken).toBeNull();
        expect(requests.length).toEqual(1);
        expect(requests[0]).toEqual(request);
      });
    });

    describe('When they like the request', () => {
      beforeAll(async () => {
        await when.a_user_likes_a_request(user, request.id);
      });

      it('Should see Request.reviewed as true', async () => {
        const { requests } = await when.a_user_calls_getRequests(user.username, 25);

        expect(requests).toHaveLength(1);
        expect(requests[0].id).toEqual(request.id);
        expect(requests[0].reviewed).toEqual(true);
      });

      it('Should not be able to like the same request a second time', async () => {
        await expect(when.a_user_likes_a_request(user, request.id))
        .rejects
        .toMatchObject({
          message: expect.stringContaining('DynamoDB transaction error')
        });
      });

      describe('When they dislike the same request', () => {
        beforeAll(async () => {
          await when.a_user_dislikes_a_request(user, request.id);
        });

        it('Should see Request.reviewed as true', async () => {
          const { requests } = await when.a_user_calls_getRequests(user.username, 25);
  
          expect(requests).toHaveLength(1);
          expect(requests[0].id).toEqual(request.id);
          expect(requests[0].reviewed).toEqual(true);
        });

        it('Should not be able to dislike the same request a second time', async () => {
          await expect(when.a_user_dislikes_a_request(user, request.id))
          .rejects
          .toMatchObject({
            message: expect.stringContaining('DynamoDB transaction error')
          });
        });
      });
    });
  });
});