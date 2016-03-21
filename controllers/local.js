'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Person = require('../models/person');

const SUCCESS_MSG = 'Login is Go!';
const INCORRECT_USERNAME_MSG = 'Email or password incorrect';
const INCORRECT_PASSWORD_MSG = 'Email or password incorrect';

passport.serializeUser(function(user, done) {
  console.log('test')
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  console.log('test2')
  Person.findById(id, done);
});

console.log("Do we reach here?");

passport.use(new LocalStrategy({
    usernameField: 'email'
  },

  (email, password, done) => {

    Person.findOne({ email: email }, function (err, user) {
      if (err) throw err;

      console.log("user >>>>", user);

      if (user) {
        user.authenticate(password, (err, valid) => {
          if (err) throw err;
          if (valid) {
            done(null, user, { message: SUCCESS_MSG});
          } else {
            done(null, null, { message: INCORRECT_PASSWORD_MSG});
          }
        })
      } else {
        done(null, null, { message: INCORRECT_USERNAME_MSG})
      }
    });
  }
));
