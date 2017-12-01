'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');
const moment = require('moment-timezone');
const cloudinary = require('cloudinary');
const env = require('../../env.json');

cloudinary.config(env.cloudinary);

exports.tweet = {

  handler: function (request, reply) {
    reply.view('tweet', {
      title: 'Tweet!',
    });
  },

};

exports.posttweet = {
  payload: {
    output: 'file',
    parse: true,
    allow: 'multipart/form-data',
  },

  validate: {

    payload: {
      message: Joi.string().min(1).max(140).required(),
      picture: Joi.any(),
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
    let data = request.payload;

    if (data.picture.bytes !== 0) {
      cloudinary.uploader.upload(data.picture.path).then(result => {
        data.imageUrl = result.url;
        return postTweet(data, userEmail, reply);
      });
    } else {
      postTweet(data, userEmail, reply);
    }
  },
}
;

function postTweet(data, userEmail, reply) {
  return User.findOne({ email: userEmail }).then(user => {
    data.author = user._id;
    data.creationDate = moment().tz('Europe/Berlin');
    let tweet = new Tweet(data);
    return tweet.save();
  }).then(newTweet => {
    reply.redirect('/mytimeline');
  }).catch(err => {
    console.log(err);
    reply.redirect('/');
  });
}

exports.deletetweets = {
  handler: function (request, reply) {
    let tweetsToDelete = request.payload.tweetToDelete;
    Tweet.remove({
      _id: {
        $in: tweetsToDelete,
      },
    }).then(res => {
      reply.redirect('/mytimeline');
    }).catch(err => {
      reply.redirect('/mytimeline');
    });
  },
};
