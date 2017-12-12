const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createToken = function (user) {
  return jwt.sign({ id: user._id, email: user.email }, 'Ib1990g@S&gnzSIb1990g@S&gnzSIb1990g@S&gnzS', {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
};

exports.decodeToken = function (token) {
  let userInfo = {};
  try {
    let decoded = jwt.verify(token, 'Ib1990g@S&gnzSIb1990g@S&gnzSIb1990g@S&gnzS');
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
  }

  return userInfo;
};

exports.validate = function (decoded, request, callback) {
  User.findOne({ _id: decoded.id }).then(user => {
    if (user != null) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }).catch(err => {
    callback(null, false);
  });
};