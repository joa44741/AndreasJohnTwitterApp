'use strict';

const assert = require('chai').assert;
const TweetService = require('./tweet-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('User API tests', function () {

  let users = fixtures.users;
  let newUser = fixtures.newUser;

  const tweetService = new TweetService(fixtures.tweetService);

  beforeEach(function () {
    tweetService.login(users[0]);
  });

  afterEach(function () {
    tweetService.logout();
  });

  test('create a user', function () {
    const returnedUser = tweetService.createUser(newUser);
    assert(_.some([returnedUser], newUser), 'returnedUser must be a superset of newUser');
    assert.isDefined(returnedUser._id);
  });

  test('get user', function () {
    const u1 = tweetService.createUser(newUser);
    const u2 = tweetService.getUser(u1._id);
    assert.deepEqual(u1, u2);
  });

  test('get invalid user', function () {
    const u1 = tweetService.getUser('1234');
    assert.isNull(u1);
    const u2 = tweetService.getUser('012345678901234567890123');
    assert.isNull(u2);
  });

  test('delete a user', function () {
    const u = tweetService.createUser(newUser);
    assert(tweetService.getUser(u._id) != null);
    tweetService.deleteOneUser(u._id);
    assert(tweetService.getUser(u._id) == null);
  });

  test('get users detail', function () {
    for (let u of users) {
      tweetService.createUser(u);
    }

    const allUsers = tweetService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert(_.some([allUsers[i]], users[i]), 'returnedUser must be a superset of newUser');
    }
  });

  test('follow a user', function () {
    const u = tweetService.createUser(newUser);
    tweetService.followUser(u._id);
    const updatedUser = tweetService.getUser(u._id);
    assert.equal(updatedUser.followers.length, 1);
  });

  test('unfollow a user', function () {
    const u = tweetService.createUser(newUser);
    tweetService.followUser(u._id);
    const updatedUser = tweetService.getUser(u._id);
    assert.equal(updatedUser.followers.length, 1);
    tweetService.unfollowUser(u._id);
    const updatedUser2 = tweetService.getUser(u._id);
    assert.equal(updatedUser2.followers.length, 0);
  });

});
