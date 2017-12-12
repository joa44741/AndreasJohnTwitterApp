'use strict';

const SyncHttpService = require('./sync-http-service');

class TweetService {

  constructor(baseUrl) {
    this.httpService = new SyncHttpService(baseUrl);
  }

  getUsers() {
    return this.httpService.get('/api/users');
  }

  getUser(id) {
    return this.httpService.get('/api/users/' + id);
  }

  createUser(newUser) {
    return this.httpService.post('/api/users', newUser);
  }

  deleteOneUser(id) {
    return this.httpService.delete('/api/users/' + id);
  }

  followUser(userIdToFollow) {
    return this.httpService.post('/api/users/' + userIdToFollow + '/followers', '{}');
  }

  unfollowUser(userIdToUnfollow) {
    return this.httpService.delete('/api/users/' + userIdToUnfollow + '/followers');
  }

  postTweet(tweet) {
    return this.httpService.post('/api/tweets', tweet);
  }

  getAllTweets() {
    return this.httpService.get('/api/tweets');
  }

  getTweets(id) {
    return this.httpService.get('/api/users/' + id + '/tweets');
  }

  deleteAllTweets() {
    return this.httpService.delete('/api/tweets');
  }

  deleteTweets(id) {
    return this.httpService.delete('/api/users/' + id + '/tweets');
  }

  login(user) {
    return this.httpService.setAuth('/api/users/authenticate', user);
  }

  logout() {
    this.httpService.clearAuth();
  }
}

module.exports = TweetService;
