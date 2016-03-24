'use strict';

const findrep = require('./findrep');
const action = require('./action');
const Person = require('../models/person');

module.exports.dashboard = (req, res) => {
  if (res.locals.user) {
    if (res.locals.user.state) {
      var dashReps = new Promise( (resolve, reject) => {
        findrep.findFromDatabase(req, res, resolve);
      });

      dashReps.then( dashRepsResponse => {

        var dashVote = new Promise( (voteResolve, reject) => {
          action.voteInfoFromDatabase(req, res, voteResolve);
        });

        dashVote.then( dashVoteResponse => {
          console.log("How close do we get?");
          res.render('profile', {personsReps: dashRepsResponse, actionInfo: dashVoteResponse});
        });
      });
    } else {res.redirect('/');}
  } else {
    res.redirect('/register');
  }

};

module.exports.changeAddress = (req, res) => {

  const dob = res.locals.user.dob
  const now = new Date();
  // If the person is not a citizen or less than 18 they can't currently vote
  let canVote = req.body.citizen;
  if ((now - dob) < (18 * 365 * 24 * 60 * 60 * 1000)) {
    canVote = false;
  }


  console.log("WRACK DAT BODY:", req.body);

  var conditions = { _id: res.locals.user._id };
  var update = { $set: { address:req.body.street, city: req.body.city, state: req.body.state, zip: req.body.zip, canVote: canVote}};
  var options = { upsert: true };

  Person.update(conditions, update, options, (err, say) => {
    if (err) throw err;
    console.log('saved yes!')
    res.redirect('/profile');

  });
};
