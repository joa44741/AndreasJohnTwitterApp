'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');
const ObjectId = require('mongoose').mongo.ObjectId;
const cloudinary = require('cloudinary');
const env = require('../../env.json');

cloudinary.config(env.cloudinary);

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

exports.friendtweets = {

  handler: function (request, reply) {
    const userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(user => {
      return Tweet.find({
        author: {
          $in: user.followings,
        },
      }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('friendtweets', {
        title: 'Tweets',
        tweets: tweets,
      });
    }).catch(err => {
      console.log(err);
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
    user.imageUrl = 'images/unknown_user.jpg';
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
  payload: {
    output: 'file',
    parse: true,
    allow: 'multipart/form-data',
  },

  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      nickName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      picture: Joi.any(),
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
    if (editedUser.picture.bytes !== 0) {
      cloudinary.uploader.upload(editedUser.picture.path).then(result => {
        editedUser.newImage = result.url;
        return saveUser(loggedInUserEmail, editedUser, request, reply);
      });
    } else {
      saveUser(loggedInUserEmail, editedUser, request, reply);
    }
  },

};

function saveUser(loggedInUserEmail, editedUser, request, reply) {
  User.findOne({ email: loggedInUserEmail }).then(user => {
    user.firstName = editedUser.firstName;
    user.lastName = editedUser.lastName;
    user.nickName = editedUser.nickName;
    user.email = editedUser.email;
    user.password = editedUser.password;
    if (editedUser.newImage) {
      user.imageUrl = editedUser.newImage;
    }

    return user.save();
  }).then(user => {
    request.cookieAuth.set({
      loggedIn: true,
      loggedInUser: user.email,
    });
    reply.view('settings', { title: 'Edit Account Settings', user: user });
  }).catch(err => {
    console.log(err);
    reply.redirect('/');
  });
}

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

exports.mytimeline = {
  handler: function (request, reply) {
    const userEmail = request.auth.credentials.loggedInUser;
    let currentUser;
    User.findOne({ email: userEmail }).then(user => {
      let userId = user._id;
      currentUser = user;
      return Tweet.find({ author: userId }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('mytimeline', {
        title: 'My Timeline',
        user: currentUser,
        tweets: tweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.showtimeline = {
  handler: function (request, reply) {
    let userId = request.query.userId;

    let currentUserEmail = request.auth.credentials.loggedInUser;
    let currentUser;
    User.findOne({ email: currentUserEmail }).then(user => {
      if (userId === user._id.toString()) {
        reply.redirect('mytimeline');
      } else {
        currentUser = user;
      }
    }).catch(err => {
      reply.redirect('/');
    });

    let userToShow;
    User.findOne({ _id: userId }).then(user => {
      userToShow = user;
      return Tweet.find({ author: userId }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('showtimeline', {
        title: 'Timeline of User ' + userToShow.nickName,
        tweets: tweets,
        user: userToShow,
        isfollowing: currentUser.followings.indexOf(new ObjectId(userId)) !== -1,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.followuser = {
  handler: function (request, reply) {
    let userIdToFollow = request.payload.userId;
    let currentUserEmail = request.auth.credentials.loggedInUser;
    let currentUser;
    let userToFollow;

    User.findOne({ email: currentUserEmail }).then(user => {
      currentUser = user;
      return User.findOne({ _id: userIdToFollow });
    }).then(user => {
      userToFollow = user;
      userToFollow.followers.push(currentUser._id);
      currentUser.followings.push(userToFollow._id);

      userToFollow.save();
      currentUser.save();

      return Tweet.find({ author: userIdToFollow }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('showtimeline', {
        title: 'Timeline of User ' + userToFollow.nickName,
        tweets: tweets,
        user: userToFollow,
        isfollowing: currentUser.followings.indexOf(new ObjectId(userIdToFollow)) !== -1,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.unfollowuser = {
  handler: function (request, reply) {
    const userIdToUnfollow = request.payload.userId;
    const currentUserEmail = request.auth.credentials.loggedInUser;
    let currentUser;
    let userToUnfollow;

    User.updateOne({ email: currentUserEmail }, { $pullAll: { followings: [userIdToUnfollow] } }).then(updateInfo => {
      return User.findOne({ email: currentUserEmail });
    }).then(user => {
      currentUser = user;
      return User.updateOne({ _id: userIdToUnfollow }, { $pullAll: { followers: [currentUser._id] } });
    }).then(updateInfo => {
      return User.findOne({ _id: userIdToUnfollow });
    }).then(user => {
      userToUnfollow = user;
      return Tweet.find({ author: userIdToUnfollow }).populate('author').sort('-creationDate');
    }).then(tweets => {
      reply.view('showtimeline', {
        title: 'Timeline of User ' + userToUnfollow.nickName,
        tweets: tweets,
        user: userToUnfollow,
        isfollowing: currentUser.followings.indexOf(new ObjectId(userIdToUnfollow)) !== -1,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },
}
;
