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

exports.mytimeline = {
  handler: function (request, reply) {
    let userEmail = request.auth.credentials.loggedInUser;

    User.findOne({ email: userEmail }).then(user => {
      let userId = user._id;
      return Tweet.find({ author: userId }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('mytimeline', {
        title: 'My Timeline',
        tweets: tweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
