'use strict';

const Hapi = require('hapi');
const handlebars = require('handlebars');
const corsHeaders = require('hapi-cors-headers');
const utils = require('./app/api/utils');

let server = new Hapi.Server();
server.connection({ port: process.env.PORT || 4000 });

require('./app/models/db');

handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

server.register([require('inert'), require('vision'), require('hapi-auth-cookie'), require('hapi-auth-jwt2')], err => {

  if (err) {
    throw err;
  }

  server.views({
    engines: {
      hbs: require('handlebars'),
    },
    relativeTo: __dirname,
    path: './app/views',
    layoutPath: './app/views/layout',
    partialsPath: './app/views/partials',
    layout: true,
    isCached: false,
  });

  server.auth.strategy('standard', 'cookie', {
    password: 'Ib1990g@S&gnzSIb1990g@S&gnzSIb1990g@S&gnzS',
    cookie: 'twitter-cookie',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
    redirectTo: '/login',
  });

  server.auth.strategy('jwt', 'jwt', {
    key: 'Ib1990g@S&gnzSIb1990g@S&gnzSIb1990g@S&gnzS',
    validateFunc: utils.validate,
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.ext('onPreResponse', corsHeaders);
  server.route(require('./routes'));
  server.route(require('./routesapi'));

  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });

});
