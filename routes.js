const Assets = require('./app/controllers/assets');

module.exports = [
  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },
];
