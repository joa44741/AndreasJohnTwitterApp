'use strict';

const assert = require('chai').assert;
const TweetService = require('./tweet-service');
const fixtures = require('./fixtures.json');
const utils = require('../app/api/utils.js');

suite('Auth API tests', function () {

  let users = fixtures.users;

  const tweetService = new TweetService(fixtures.tweetService);

  test('login-logout', function () {
    let returnedUsers = tweetService.getUsers();
    assert.isNull(returnedUsers);

    const response = tweetService.login(users[0]);
    returnedUsers = tweetService.getUsers();
    assert.isNotNull(returnedUsers);

    tweetService.logout();
    returnedUsers = tweetService.getUsers();
    assert.isNull(returnedUsers);
  });
});
