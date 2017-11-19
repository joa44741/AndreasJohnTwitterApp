'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');
const moment = require('moment-timezone');

exports.friendtweets = {

  handler: function (request, reply) {
    reply.view('friendtweets', {
      title: 'Tweets',
    });
  },

};

exports.tweet = {

  handler: function (request, reply) {
    reply.view('tweet', {
      title: 'Tweet!',
    });
  },

};

exports.posttweet = {
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
    User.findOne({ email: userEmail }).then(user => {
      let data = request.payload;
      data.author = user._id;
      data.creationDate = moment().tz('Europe/Berlin');
      let tweet = new Tweet(data);
      return tweet.save();
    }).then(newTweet => {
      reply.redirect('/mytimeline');
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.deletetweets = {
  handler: function (request, reply) {
    let tweetsToDelete = request.payload.tweetToDelete;
    Tweet.remove({ _id: {
      $in: tweetsToDelete,
    }, }).then(res => {
      reply.redirect('/mytimeline');
    }).catch(err => {
      reply.redirect('/mytimeline');
    });
  },
};
