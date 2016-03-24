'use strict';

const request = require('request');
const API = require('../API') // Anyone cloning this will need their own API-Key
const Person = require('../models/person');
const Vote = require('../models/vote');

module.exports.display = (req, res) => {
  res.render('action');
};

module.exports.getInfo = (req, res) => {

  let searchTerms = req.body.address;
  const electionUrl = `https://www.googleapis.com/civicinfo/v2/elections?key=${API.civicKey}`;

  request.get(electionUrl, (err, response, data) => {
    if (err) throw err;

    let elections = JSON.parse(data);
    elections = elections.elections;
    elections.shift();

    const voterInfoUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?address=${searchTerms}&electionId=2000&key=${API.civicKey}`;

    request.get(voterInfoUrl, (err, response, data) => {
      if (err) throw err;

      let parsedData = JSON.parse(data);
      let voterinfo = parsedData.state

      let stateElections = [];
      for (let i = 0; i < parsedData.contests.length; i++) {
        if (parsedData.contests[i].type === "General") {
          stateElections.push(parsedData.contests[i]);
        }
      }


      let localElectionInfoUrl;
      if (voterinfo[0].local_jurisdiction) {
        localElectionInfoUrl = voterinfo[0].local_jurisdiction.electionAdministrationBody.electionInfoUrl;
      } else {
        localElectionInfoUrl = "Not Found";
      }

      let userID = "Guest";
      if (res.locals.user) {
        userID = res.locals.user._id;
      }

      let everything = new Vote({
        userID: userID,
        voterState: voterinfo[0].name,
        stateElectionInfo: voterinfo[0].electionAdministrationBody.electionInfoUrl,
        localElectionInfo: localElectionInfoUrl,
        registrationStatus: voterinfo[0].electionAdministrationBody.electionRegistrationConfirmationUrl,
        registrationToVote: voterinfo[0].electionAdministrationBody.electionRegistrationUrl,
        whereToVote: voterinfo[0].electionAdministrationBody.votingLocationFinderUrl,
        address: {
          street: parsedData.normalizedInput.line1,
          city: parsedData.normalizedInput.city,
          state: parsedData.normalizedInput.state,
          zip: parsedData.normalizedInput.zip
        },
        allElections: elections,
        elections: parsedData.contests,
        stateElections: stateElections
      });

      if (userID !== "Guest") {
        Vote.findOne({ userID: userID }, function (err, voter) {
          if (err) throw err;

          if (voter) {
            console.log("You already have Info!");
            // resolve(everything);
            res.render("action", {actionInfo: everything});
          } else {
            everything.save( (err) => {
              if (err) throw err;

              console.log("SAVED ELECTIONS!");
              // resolve(everything);
              res.render("action", {actionInfo: everything});
            });
          }
        });
      } else {
        console.log("Did NOT save elections", elections);
        // resolve(everything);;
        res.render("action", {actionInfo: everything});
      }

    })
  })

};


      // const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
      // const diff = new Date() - doc._id.getTimestamp() - FIFTEEN_MINUTES_IN_MS;
      // const lessThan15MinutesAgo = diff < 0;

      // if (lessThan15MinutesAgo) {
      //   res.send(doc);
      //   return;
      // }
