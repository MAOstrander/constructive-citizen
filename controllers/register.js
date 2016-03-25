'use strict';

const request = require('request');
const express = require('express');
const passport = require('passport');
const router = express.Router();

require('./local');

const Person = require('../models/person');

module.exports.form = (req, res) => {
  res.render('register');
};

module.exports.signout = (req, res) => {
  req.session.regenerate(function(err) {
    if (err) throw err;

    res.redirect('/');
  });
};


module.exports.signup = (req, res) => {
  const dob = new Date(req.body.byear, req.body.bmonth, req.body.bday);
  const now = new Date();
  // If the person is not a citizen or less than 18 they can't currently vote
  let canVote = req.body.citizen;
  if ((now - dob) < (18 * 365 * 24 * 60 * 60 * 1000)) {
    canVote = false;
  }

  const newPerson = new Person({
    email: req.body.email,
    password: req.body.password,
    fName: req.body.fName,
    lName: req.body.lName,
    dob: dob,
    address: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    canVote: canVote
  });

  Person.findOne({email: req.body.email}, (err, user) => {
    if (err) throw err;

    if (user) {
      res.render('register', {message: "Username already exists"});
    } else {
      Person.create(newPerson, (err) => {
        if (err) throw err;

        res.render('register', {message: "Account created! Now log in to complete process"});
      });
    }
  });



};
