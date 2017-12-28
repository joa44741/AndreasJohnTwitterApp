'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Boom = require('boom');
const utils = require('./utils');
const moment = require('moment-timezone');
const cloudinary = require('cloudinary');
const env = require('../../env.json');
const ObjectId = require('mongoose').mongo.ObjectId;

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

exports.findTweetsOfFriends = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const userId = getAuthorIdByTokenInRequest(request);

    User.findOne({ _id: userId }).then(user => {
      return Tweet.find({
        author: {
          $in: user.followings,
        },
      }).populate('author').sort('-creationDate');
    }).then(tweets => {
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
    if (data.picture != null) {
      cloudinary.uploader.upload(data.picture).then(result => {
        data.imageUrl = result.url;
        return postTweet(data, reply);
      }).catch(err => {
        console.log(err);
        reply(Boom.badImplementation('error posting tweet'));
      });
    } else {
      postTweet(data, reply);
    }
  },

};

function postTweet(data, reply) {
  data.creationDate = moment().tz('Europe/Berlin');
  let tweet = new Tweet(data);
  return tweet.save().then(savedTweet => {
    return Tweet.populate(savedTweet, 'author');
  }).then(populatedTweet => {
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

    const currentUserId = getAuthorIdByTokenInRequest(request);

    User.findOne({ _id: currentUserId }).then(user => {
      if (user.isAdmin) {
        return Tweet.remove({});
      } else {
        reply(Boom.unauthorized('error removing Tweets: no admin account'));
      }
    }).then(result => {
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
    const currentUserId = getAuthorIdByTokenInRequest(request);
    const userIdInRequest = request.params.id;

    User.findOne({ _id: currentUserId }).then(user => {
      if (currentUserId === userIdInRequest || user.isAdmin) {
        return Tweet.remove({ author: userIdInRequest });
      } else {
        reply(Boom.unauthorized('error removing Tweets'));
      }
    }).then(result => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing Tweets'));
    });
    ;
  },
};

function getAuthorIdByTokenInRequest(request) {
  const authorization = request.headers.authorization;
  const token = authorization.replace('bearer ', '');
  const author = utils.decodeToken(token).userId;
  return author;
}

exports.deleteOneTweet = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const tweetIdToRemove = request.params.id;
    const currentUserId = getAuthorIdByTokenInRequest(request);
    let currentUser;

    User.findOne({ _id: currentUserId }).then(user => {
      currentUser = user;
      return Tweet.findOne({ _id: tweetIdToRemove });
    }).then(tweet => {
      if (currentUser.isAdmin || tweet.author.equals(new ObjectId(currentUserId))) {
        return Tweet.remove({ _id: tweetIdToRemove });
      } else {
        reply(Boom.unauthorized('error removing Tweet'));
      }
    }).then(res => {
      reply().code(204);
    });

  },

};
