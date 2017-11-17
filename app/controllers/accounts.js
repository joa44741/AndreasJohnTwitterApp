'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');

exports.main = {
  auth: false,
  handler: function (request, reply) {
    Tweet.find({}).populate('author').sort('-creationDate').then(tweets => {
      reply.view('main', {
        title: 'Welcome to Johnny\'s Twitter',
        tweets: tweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.home = {
  handler: function (request, reply) {
    let loggedIn = request.auth.credentials.loggedIn;
    Tweet.find({}).populate('author').sort('-creationDate').then(tweets => {
      reply.view('main', {
        title: 'Welcome to Johnny\'s Twitter',
        tweets: tweets,
        loggedIn: loggedIn,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.signup = {
  auth: false,
  handler: function (request, reply) {
    reply.view('signup', { title: 'Sign up for Johnny\'s Twitter' });
  },

};

exports.login = {
  auth: false,
  handler: function (request, reply) {
    reply.view('login', { title: 'Login to Johnny\'s Twitter ' });
  },

};

exports.logout = {
  auth: false,
  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};

exports.register = {
  auth: false,

  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      nickName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('signup', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const user = new User(request.payload);

    user.save().then(newUser => {
      reply.redirect('/login');
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.authenticate = {
  auth: false,
  validate: {

    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('login', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },
  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: user.email,
        });
        reply.redirect('/friendtweets');
      } else {
        reply.redirect('/login');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.viewSettings = {
  handler: function (request, reply) {
    const userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      reply.view('settings', { title: 'Edit Account Settings', user: foundUser });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.updateSettings = {
  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      nickName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('settings', {
        title: 'Update settings error',
        errors: error.data.details,
        user: request.payload,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },
  handler: function (request, reply) {
    const loggedInUserEmail = request.auth.credentials.loggedInUser;
    const editedUser = request.payload;
    User.findOne({ email: loggedInUserEmail }).then(user => {
      user.firstName = editedUser.firstName;
      user.lastName = editedUser.lastName;
      user.nickName = editedUser.nickName;
      user.email = editedUser.email;
      user.password = editedUser.password;
      return user.save();
    }).then(user => {
      request.cookieAuth.set({
        loggedIn: true,
        loggedInUser: user.email,
      });
      reply.view('settings', { title: 'Edit Account Settings', user: user });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.usersearch = {
  handler: function (request, reply) {
    const userEmail = request.auth.credentials.loggedInUser;
    User.find({ email: { $ne: userEmail } }).then(foundUsers => {
      reply.view('usersearch', { title: 'Search for users', users: foundUsers });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
