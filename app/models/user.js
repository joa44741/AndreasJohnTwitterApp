'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  nickName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
