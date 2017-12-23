const UsersApi = require('./app/api/usersapi');
const TweetsApi = require('./app/api/tweetsapi');

module.exports = [
  { method: 'GET', path: '/api/user', config: UsersApi.getLoggedInUserId },
  { method: 'GET', path: '/api/users', config: UsersApi.find },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },
  { method: 'DELETE', path: '/api/users', config: UsersApi.deleteAll },
  { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticate },
  { method: 'POST', path: '/api/users/{id}/followers', config: UsersApi.followuser },
  { method: 'DELETE', path: '/api/users/{id}/followers', config: UsersApi.unfollowuser },
  { method: 'POST', path: '/api/users/{id}', config: UsersApi.updateSettings },
  { method: 'GET', path: '/api/tweets', config: TweetsApi.findAllTweets },
  { method: 'GET', path: '/api/users/{id}/tweets', config: TweetsApi.findTweets },
  { method: 'GET', path: '/api/users/followings/tweets', config: TweetsApi.findTweetsOfFriends },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.postTweet },
  { method: 'DELETE', path: '/api/tweets', config: TweetsApi.deleteAllTweets },
  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOneTweet },
  { method: 'DELETE', path: '/api/users/{id}/tweets', config: TweetsApi.deleteTweets },
];
