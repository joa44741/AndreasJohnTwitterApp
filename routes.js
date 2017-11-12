const Accounts = require('./app/controllers/accounts');
const Tweets = require('./app/controllers/tweets');
const Assets = require('./app/controllers/assets');

module.exports = [
  { method: 'GET', path: '/', config: Accounts.main },
  { method: 'GET', path: '/home', config: Accounts.home },
  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'GET', path: '/logout', config: Accounts.logout },

  { method: 'GET', path: '/friendtweets', config: Tweets.friendtweets },
  { method: 'GET', path: '/tweet', config: Tweets.tweet },
  { method: 'POST', path: '/tweet', config: Tweets.postTweet },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },
];
