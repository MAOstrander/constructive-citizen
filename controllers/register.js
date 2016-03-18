'use strict';

const request = require('request');
const Person = require('../models/person');

module.exports.form = (req, res) => {
  res.render('register');
};


module.exports.signup = (req, res) => {
  console.log("What was typed in? >>>>", req.body);
  const dob = new Date(req.body.byear, req.body.bmonth, req.body.bday);
  const now = new Date();
  // If the person is not a citizen or less than 18 they can't currently vote
  let canVote = req.body.citizen;
  if ((now - dob) < (18 * 365 * 24 * 60 * 60 * 1000)) {
    canVote = false;
  }

  const newPerson = new Person({
    email: req.body.email,
    fName: req.body.fName,
    lName: req.body.lName,
    dob: dob,
    address: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    canVote: canVote
  });

  console.log("newPerson", newPerson);
  // newPerson.save( (err) => {
  //   if (err) throw err;

    res.send(`Welcome ${newPerson.fName}`);
  // });

};

module.exports.login = (req, res) => {
  res.send(`Logged in`);
};
