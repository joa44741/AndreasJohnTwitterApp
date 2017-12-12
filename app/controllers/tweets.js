'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');
const moment = require('moment-timezone');
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
