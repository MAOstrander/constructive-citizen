'use strict';

const findrep = require('./findrep');
const action = require('./action');

module.exports.dashboard = (req, res) => {
  if (res.locals.user) {
    var dashReps = new Promise( (resolve, reject) => {
      findrep.findFromDatabase(req, res, resolve);
    });

    dashReps.then( dashRepsResponse => {
      console.log("YAY", dashRepsResponse);

      var dashVote = new Promise( (voteResolve, reject) => {
        action.voteInfoFromDatabase(req, res, voteResolve);
      });

      dashVote.then( dashVoteResponse => {
        console.log("How close do we get?");
        res.render('profile', {personsReps: dashRepsResponse, actionInfo: dashVoteResponse});

      });
    });
  } else {
    res.redirect('/register');
  }

};
