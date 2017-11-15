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
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },

  { method: 'GET', path: '/friendtweets', config: Tweets.friendtweets },
  { method: 'GET', path: '/tweet', config: Tweets.tweet },
  { method: 'POST', path: '/tweet', config: Tweets.posttweet },
  { method: 'GET', path: '/mytimeline', config: Tweets.mytimeline },
  { method: 'POST', path: '/mytimeline', config: Tweets.deletetweets },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },
];
