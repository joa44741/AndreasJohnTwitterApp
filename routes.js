const Accounts = require('./app/controllers/accounts');
const Tweets = require('./app/controllers/tweets');
const Assets = require('./app/controllers/assets');

module.exports = [
  { method: 'GET', path: '/', config: Tweets.main },
  { method: 'GET', path: '/home', config: Tweets.home },
  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  { method: 'GET', path: '/usersearch', config: Accounts.usersearch },
  { method: 'GET', path: '/friendtweets', config: Tweets.friendtweets },
  { method: 'GET', path: '/tweet', config: Tweets.tweet },
  { method: 'POST', path: '/tweet', config: Tweets.posttweet },
  { method: 'GET', path: '/mytimeline', config: Tweets.mytimeline },
  { method: 'POST', path: '/mytimeline', config: Tweets.deletetweets },
  { method: 'GET', path: '/showtimeline', config: Tweets.showtimeline },
  { method: 'POST', path: '/followuser', config: Accounts.followuser },
  { method: 'POST', path: '/unfollowuser', config: Accounts.unfollowuser },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },
];
