'use strict';

const User = require('../models/user');
const Boom = require('boom');
const utils = require('./utils');

exports.find = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.find({}).then(users => {
      reply(users);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOne = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then(user => {
      if (user === null) {
        reply(Boom.notFound('id not found'));
      } else {
        reply(user);
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.create = {

  auth: false,

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.save().then(newUser => {
      reply(newUser).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating user'));
    });
  },

};

exports.deleteAll = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.remove({}).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing users'));
    });
  },

};

exports.deleteOne = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.remove({ _id: request.params.id }).then(res => {
      if (res.result.n === 0) {
        reply(Boom.notFound('id not found'));
      }

      reply().code(204);
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.authenticate = {

  auth: false,

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        const token = utils.createToken(foundUser);
        reply({ success: true, token: token }).code(201);
      } else {
        reply({ success: false, message: 'Authentication failed. User not found.' }).code(201);
      }
    }).catch(err => {
      reply(Boom.notFound('internal db failure'));
    });
  },

};

exports.followuser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {

    let currentUserId = getAuthorIdByTokenInRequest(request);
    let userToFollow;
    let currentUser;
    const userIdToFollow = request.params.id;

    User.findOne({ _id: userIdToFollow }).then(user => {
      if (user === null) {
        reply(Boom.notFound('id not found'));
      } else {
        userToFollow = user;
        return User.findOne({ _id: currentUserId });
      }
    }).then(user => {
      currentUser = user;
      userToFollow.followers.push(currentUser._id);
      currentUser.followings.push(userToFollow._id);

      userToFollow.save();
      currentUser.save();
      reply(userToFollow).code(201);
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },
};

exports.unfollowuser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {

    const currentUserId = getAuthorIdByTokenInRequest(request);
    let userToUnfollow;
    let currentUser;
    const userIdToUnfollow = request.params.id;

    User.updateOne({ _id: currentUserId }, { $pullAll: { followings: [userIdToUnfollow] } }).then(updateInfo => {
      return User.findOne({ _id: currentUserId });
    }).then(user => {
      currentUser = user;
      return User.updateOne({ _id: userIdToUnfollow }, { $pullAll: { followers: [currentUser._id] } });
    }).then(updateInfo => {
      return User.findOne({ _id: userIdToUnfollow });
    }).then(user => {
      userToUnfollow = user;
      reply().code(204);
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });

  },
};

function getAuthorIdByTokenInRequest(request) {
  const authorization = request.headers.authorization;
  const token = authorization.replace('bearer ', '');
  const author = utils.decodeToken(token).userId;
  return author;
}
