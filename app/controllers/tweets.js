'use strict';

//const Tweet = require('../models/tweet');
//const User = require('../models/user');
const Joi = require('joi');

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
