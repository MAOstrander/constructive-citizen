'use strict';

const request = require('request');
const API = require('../API') // Anyone cloning this will need their own API-Key
const Person = require('../models/person');
const Vote = require('../models/vote');

function voteApiSearch(searchTerms, req, res, resolve) {
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
            resolve(everything);
          } else {
            everything.save( (err) => {
              if (err) throw err;

              console.log("SAVED ELECTIONS!");
              resolve(everything);
            });
          }
        });
      } else {
        console.log("Did NOT save elections", elections);
        resolve(everything);;
      }

    })
  })
}

module.exports.display = (req, res) => {

  if (res.locals.user) {
    Person.findOne({ _id: res.locals.user._id }, function (err, person) {
      if (err) throw err;

      let searchTerms = `${person.address} ${person.city} ${person.state} ${person.zip}`;
      console.log("searchTerms", searchTerms);

      Vote.findOne({ userID: res.locals.user._id }, function (err, voter) {
        if (err) throw err;

        let lessThanDayAgo = false;
        if (voter) {
          console.log("Displaying stored data");
          const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
          const diff = new Date() - voter._id.getTimestamp() - ONE_DAY_IN_MS;
          lessThanDayAgo = diff < 0;
        }

        if (lessThanDayAgo && voter) {
          console.log("recent times");
            res.render('action', {actionInfo: voter});
        } else {

          var newVote = new Promise( (resolve, reject) => {
            voteApiSearch(searchTerms, req, res, resolve);
          });

          newVote.then( val => {
            console.log("results from voteApiSearch:", val);
            res.render('action', {actionInfo: val});
          });
        }

      }); // Vote.findone
    }); // Person.findone

  } else {
    res.render('action');
  }

};



module.exports.getInfo = (req, res) => {

  let searchTerms = req.body.address;

  var newVote = new Promise( (resolve, reject) => {
    voteApiSearch(searchTerms, req, res, resolve);
  });

  newVote.then( val => {
    console.log("results from voteApiSearch:", val);
    res.render('action', {actionInfo: val});
  });

};
