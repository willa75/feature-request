require('../../steps/init');
const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();


describe('Given an authenticated user', () => {
  let user;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe('When the user sends a feature request', () => {
    let request;
    const text = chance.string({ length: 250 });
    beforeAll(async () => {
      request = await when.we_invoke_add_request(user.username, text);
    });

    it('Saves the request to the Requests table', async () => {
      await then.request_exists_in_RequestsTable(request.id);
    });

    it('Increments the requestCount in the Users table to 1', async () => {
      await then.requestCount_is_updated_in_UsersTable(user.username, 1);
    });
  });
});