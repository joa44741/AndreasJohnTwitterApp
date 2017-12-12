'use strict';

const Tweet = require('../models/tweet');
const Boom = require('boom');
const utils = require('./utils');
const moment = require('moment-timezone');
const cloudinary = require('cloudinary');
const env = require('../../env.json');

cloudinary.config(env.cloudinary);
exports.findAllTweets = {

  auth: false,

  handler: function (request, reply) {
    Tweet.find({}).populate('author').sort('-creationDate').then(tweets => {
      reply(tweets);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },
};

exports.findTweets = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.find({ author: request.params.id }).populate('author').sort('-creationDate').then(tweets => {
      reply(tweets);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.postTweet = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    let data = request.payload;
    const authorId = getAuthorIdByTokenInRequest(request);
    data.author = authorId;
    if (data.picture && data.picture.bytes !== 0) {
      cloudinary.uploader.upload(data.picture.path).then(result => {
        data.imageUrl = result.url;
        return postTweet(data, reply);
      });
    } else {
      postTweet(data, reply);
    }
  },

};

function postTweet(data, reply) {
  data.creationDate = moment().tz('Europe/Berlin');
  let tweet = new Tweet(data);
  return tweet.save().then(populatedTweet => {
    reply(populatedTweet).code(201);
  }).catch(err => {
    console.log(err);
    reply(Boom.badImplementation('error posting tweet'));
  });
}

exports.deleteAllTweets = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.remove({}).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing Tweets'));
    });
  },

};

exports.deleteTweets = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const author = getAuthorIdByTokenInRequest(request);
    Tweet.remove({ author: author }).then(result => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing Tweets'));
    });
  },
};

function getAuthorIdByTokenInRequest(request) {
  const authorization = request.headers.authorization;
  const token = authorization.replace('bearer ', '');
  const author = utils.decodeToken(token).userId;
  return author;
}
