'use strict';

const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  message: {
    type: String,
    maxlength: 140,
    minlength: 1,
  },
  creationDate: Date,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  imageUrl: String,
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
