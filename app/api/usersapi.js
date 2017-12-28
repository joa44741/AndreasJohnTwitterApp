'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Boom = require('boom');
const utils = require('./utils');
const cloudinary = require('cloudinary');
const env = require('../../env.json');

cloudinary.config(env.cloudinary);

exports.find = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.find({ isAdmin: false }).then(users => {
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
      reply(Boom.badImplementation('error creating user: '+ err));
    });
  },

};

exports.deleteAll = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {

    const currentUserId = getAuthorIdByTokenInRequest(request);
    User.findOne({ _id: currentUserId }).then(user => {
      if (!user.isAdmin) {
        reply(Boom.unauthorized('error deleting users'));
      } else {
        return Tweet.remove({});
      }
    }).then(res => {
      return User.remove({ isAdmin: false });
    }).then(res => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error deleting users'));
    });
  },

};

exports.deleteOne = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const currentUserId = getAuthorIdByTokenInRequest(request);
    const userId = request.params.id;
    User.findOne({ _id: currentUserId }).then(user => {
        if (!user.isAdmin) {
          reply(Boom.unauthorized('error deleting user'));
        }else {
          return Tweet.remove({ author: userId });
        }
      }).then(res => {
      return User.remove({ _id: userId });
    }).then(res => {
        if (res.result.n === 0) {
          reply(Boom.notFound('id not found'));
        }
        reply().code(204);
      }).catch(err => {
      reply(Boom.badImplementation('error deleting users: ' + err));
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
        reply({ success: true, isAdmin: foundUser.isAdmin, token: token }).code(201);
      } else {
        reply({ success: false, message: 'Authentication failed. User not found.' }).code(200);
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

    if (currentUserId === userIdToFollow) {
      reply(Boom.badData('It\'s not allowed to follow yourself'));
    }

    User.findOne({ _id: userIdToFollow }).then(user => {
      if (user === null) {
        reply(Boom.notFound('id not found'));
      } else {
        userToFollow = user;
        return User.findOne({ _id: currentUserId });
      }
    }).then(user => {
      currentUser = user;
      if (currentUser.followings.indexOf(userIdToFollow) === -1) {
        userToFollow.followers.push(currentUser._id);
        currentUser.followings.push(userToFollow._id);
        userToFollow.save();
        currentUser.save();
      }

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

exports.getLoggedInUserId = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const currentUserId = getAuthorIdByTokenInRequest(request);
    reply({ currentUserId: currentUserId });
  },
};

function getAuthorIdByTokenInRequest(request) {
  const authorization = request.headers.authorization;
  const token = authorization.replace('bearer ', '');
  const author = utils.decodeToken(token).userId;
  return author;
}

exports.updateSettings = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const userId = getAuthorIdByTokenInRequest(request);
    const editedUser = request.payload;
    if (editedUser.image.startsWith('data:image')) {
      cloudinary.uploader.upload(editedUser.image).then(result => {
        editedUser.imageUrl = result.url;
        return saveUser(userId, editedUser, reply);
      }).catch(err => {
        console.log(err);
        reply(Boom.badImplementation('error updating settings'));
      });
    } else {
      editedUser.imageUrl = editedUser.image;
      saveUser(userId, editedUser, reply);
    }
  },

};

function saveUser(userId, editedUser, reply) {
  User.findOne({ _id: userId }).then(user => {
    user.firstName = editedUser.firstName;
    user.lastName = editedUser.lastName;
    user.nickName = editedUser.nickName;
    user.email = editedUser.email;
    user.password = editedUser.password;
    user.imageUrl = editedUser.imageUrl;

    return user.save();
  }).then(user => {
    const token = utils.createToken(user);
    reply({ success: true, token: token, imageUrl: user.imageUrl }).code(201);
  }).catch(err => {
    console.log(err);
    reply(Boom.badImplementation('error updating settings'));
  });
}

