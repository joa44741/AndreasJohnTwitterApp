'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');

exports.friendtweets = {

  handler: function (request, reply) {
    reply.view('friendtweets', {
      title: 'Tweets',
    });
  },
  /*  Candidate.find({}).then(candidates => {
      reply.view('home', {
        title: 'Make a Donation',
        candidates: candidates,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },
  */

};

exports.tweet = {

  handler: function (request, reply) {
    reply.view('tweet', {
      title: 'Tweet!',
    });
  },

};

exports.postTweet = {
  validate: {

    payload: {
      message: Joi.string().min(1).max(140).required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('tweet', {
        title: 'Error while posting tweet',
        errors: error.data.details,
      }).code(400);
    },

  },
  handler: function (request, reply) {
    let userEmail = request.auth.credentials.loggedInUser;
    let tweet = null;

    User.findOne({ email: userEmail }).then(user => {
      let data = request.payload;
      data.author = user._id;
      data.creationDate = new Date();
      tweet = new Tweet(data);
      return tweet.save();
    }).then(newTweet => {
      reply.redirect('/home');
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
