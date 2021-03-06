'use strict';

const action = require('./action');
const Myreps = require('../models/myreps');
const Person = require('../models/person');
const Reminder = require('../models/reminder');

module.exports.dashboard = (req, res) => {
  if (res.locals.user) {

    const date = new Date(res.locals.user.dob);
    const displayDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    if (res.locals.user.state) {

      var dashVote = new Promise( (voteResolve, reject) => {
        action.voteInfoFromDatabase(req, res, voteResolve);
      });

      dashVote.then( dashVoteResponse => {
        Reminder.find({userID: res.locals.user._id}, (err, reminderList) => {
          if (err) throw err;

          res.render('profile', {actionInfo: dashVoteResponse, reminders: reminderList, displayDate: displayDate});
        })
      });
    } else {res.redirect('/');}
  } else {
    res.redirect('/register');
  }

};

module.exports.changeAddress = (req, res) => {
  const dob = res.locals.user.dob
  const now = new Date();

  let isCitizen = req.body.citizen;
  let canVote = isCitizen;
  let overEighteen = (now - dob) > (18 * 365 * 24 * 60 * 60 * 1000);
  if (!overEighteen) {
    canVote = false;
  }

  var conditions = { _id: res.locals.user._id };
  var update = { $set: { address:req.body.street, city: req.body.city, state: req.body.state, zip: req.body.zip, isCitizen: isCitizen, overEighteen: overEighteen, canVote: canVote}};
  var options = { upsert: true };

  Person.update(conditions, update, options, (err, say) => {
    if (err) throw err;

    Myreps.remove({userID: res.locals.user._id}, (err, doc) => {
      if (err) throw err;

      res.redirect('/profile');
    });

  });
};

module.exports.addReminder = (req, res) => {

  const newEvent = new Reminder({
    userID: res.locals.user._id,
    when: req.body.when,
    what: req.body.what,
    notes: req.body.notes
  });

  newEvent.save( (err) => {
    if (err) throw err;

    res.redirect('/profile');
  });
}

module.exports.removeReminder = (req, res) => {
  Reminder.findById(req.params.deleteID)
    .exec(function(err, doc) {
      if (err) throw err;

      doc.remove(function(err) {
        if (err) throw err;

        res.send({})
      });
    });

}

