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
        const result = await when.a_user_calls_getRequests(user, 25);
        requests = result.requests;
        nextToken = result.nextToken;
      });

      it('They will see the new request in the requests array', async () => {
        expect(nextToken).toBeNull();
        // expect(requests.length).toEqual(1);
        expect(requests[0]).toEqual(request);
      });
    });

    describe('When they like the request', () => {
      beforeAll(async () => {
        await when.a_user_likes_a_request(user, request.id);
      });

      it('Should see Request.liked as true', async () => {
        const { requests } = await when.a_user_calls_getRequests(user, 25);

        // expect(requests).toHaveLength(1);
        expect(requests[0].id).toEqual(request.id);
        expect(requests[0].liked).toEqual(true);
      });

      it('Should not be able to like the same request a second time', async () => {
        await expect(when.a_user_likes_a_request(user, request.id))
        .rejects
        .toMatchObject({
          message: expect.stringContaining('DynamoDB transaction error')
        });
      });

      describe.skip('When they unlike the request', () => {
        beforeAll(async () => {
          await when.a_user_unlikes_a_request(user, request.id);
        });

        it('Should see Request.liked as false', async () => {
          const { requests } = await when.a_user_calls_getRequests(user, 25);

          expect(requests).toHaveLength(1);
          expect(requests[0].likes).toEqual(0);
          expect(requests[0].id).toEqual(request.id);
          expect(requests[0].liked).toEqual(false);
        });

        it('Should not be able to unlike the same request a second time', async () => {
          await expect(when.a_user_unlikes_a_request(user, request.id))
          .rejects
          .toMatchObject({
            message: expect.stringContaining('DynamoDB transaction error')
          });
        });
      });
    });
  });
});