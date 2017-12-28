'use strict';

const assert = require('chai').assert;
const TweetService = require('./tweet-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('User API tests', function () {

  let users = fixtures.users;
  let newUser = fixtures.newUser;
  let admin = fixtures.users[3];

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
    tweetService.logout();
    tweetService.login(admin);
    tweetService.deleteOneUser(returnedUser._id);
  });

  test('get user', function () {
    const u1 = tweetService.createUser(newUser);
    const u2 = tweetService.getUser(u1._id);
    assert.deepEqual(u1, u2);
    tweetService.logout();
    tweetService.login(admin);
    tweetService.deleteOneUser(u1._id);
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

    const allUsers = tweetService.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].nickName === 'admin') {
        continue;
      }

      console.log(allUsers[i]);
      console.log(users[i]);
      assert(_.some([allUsers[i]], users[i]), 'returnedUser must be a superset of newUser');
    }
  });

  test('follow a user', function () {
    const u = tweetService.createUser(newUser);
    tweetService.followUser(u._id);
    const updatedUser = tweetService.getUser(u._id);
    assert.equal(updatedUser.followers.length, 1);
    tweetService.unfollowUser(u._id);
    tweetService.logout();
    tweetService.login(admin);
    tweetService.deleteOneUser(u._id);
  });

  test('unfollow a user', function () {
    const u = tweetService.createUser(newUser);
    tweetService.followUser(u._id);
    const updatedUser = tweetService.getUser(u._id);
    assert.equal(updatedUser.followers.length, 1);
    tweetService.unfollowUser(u._id);
    const updatedUser2 = tweetService.getUser(u._id);
    assert.equal(updatedUser2.followers.length, 0);
    tweetService.logout();
    tweetService.login(admin);
    tweetService.deleteOneUser(u._id);
  });

  test('update settings', function () {

    const currentUserId = tweetService.getCurrentUserId();
    const currentUser = tweetService.getUser(currentUserId);
    console.log(currentUser);
    currentUser.firstName = 'Update';
    currentUser.lastName = 'Me';
    currentUser.image = currentUser.imageUrl;
    tweetService.updateSettings(currentUser);
    const updatedUser = tweetService.getUser(currentUser._id);
    assert.equal(currentUser.firstName, updatedUser.firstName);
    assert.equal(currentUser.lastName, updatedUser.lastName);
    currentUser.firstName = users[0].firstName;
    currentUser.lastName = users[0].lastName;
    tweetService.updateSettings(currentUser);
    console.log(tweetService.getUser(currentUser._id));
  });

});
