'use strict';

const assert = require('chai').assert;
const TweetService = require('./tweet-service');
const fixtures = require('./fixtures.json');
const _ = require('lodash');

suite('Tweet API tests', function () {

  let users = fixtures.users;
  let tweets = fixtures.tweets;

  const tweetService = new TweetService(fixtures.tweetService);

  beforeEach(function () {
    tweetService.login(users[0]);
    tweetService.deleteAllTweets();
  });

  afterEach(function () {
    tweetService.deleteAllTweets();
    tweetService.logout();
  });

  test('create a post', function () {
    tweetService.postTweet(tweets[0]);
    const returnedTweets = tweetService.getAllTweets();
    assert.equal(returnedTweets.length, 1);
    assert(_.some([returnedTweets[0].author], users[0]), 'returned author must be a superset of user');
    assert.equal(returnedTweets[0].message, tweets[0].message);
  });

  test('create multiple tweets', function () {
    for (var i = 0; i < tweets.length; i++) {
      tweetService.postTweet(tweets[i]);
    }

    const returnedTweets = tweetService.getAllTweets();
    assert.equal(returnedTweets.length, tweets.length);
    for (var i = 0; i < tweets.length; i++) {
      // tweets.length - 1 - i is needed because the sorting direction
      // of getAllTweets() is by creationdate descending
      assert.equal(returnedTweets[i].message, tweets[tweets.length - 1 - i].message);
    }
  });

  test('delete all tweets', function () {
    for (var i = 0; i < tweets.length; i++) {
      tweetService.postTweet(tweets[i]);
    }

    const d1 = tweetService.getAllTweets();
    assert.equal(d1.length, tweets.length);
    tweetService.deleteAllTweets();
    const d2 = tweetService.getAllTweets();
    assert.equal(d2.length, 0);
  });

  test('delete tweets', function () {
    let returnedUsers = tweetService.getUsers();
    let returnedUser;
    for (returnedUser of returnedUsers) {
      if (_.some(returnedUser, users[0])) {
        break;
      }
    }

    for (var i = 0; i < tweets.length; i++) {
      tweetService.postTweet(tweets[i]);
    }

    tweetService.deleteTweets(returnedUser._id);
    const d = tweetService.getTweets(returnedUser._id);
    assert.equal(d.length, 0);
  });
});
