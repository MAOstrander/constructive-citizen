'use strict';

const request = require('request');
const API = require('../API') // Anyone cloning this will need their own API-Key

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

      let everything = {
        voterState: voterinfo[0].name,
        stateElectionInfo: voterinfo[0].electionAdministrationBody.electionInfoUrl,
        localElectionInfo: localElectionInfoUrl,
        registrationStatus: voterinfo[0].electionAdministrationBody.electionRegistrationConfirmationUrl,
        registrationToVote: voterinfo[0].electionAdministrationBody.electionRegistrationUrl,
        whereToVote: voterinfo[0].electionAdministrationBody.votingLocationFinderUrl,
        userAddress: parsedData.normalizedInput,
        allElections: elections,
        elections: parsedData.contests,
        stateElections: stateElections,
        else: parsedData
      }
      console.log("elections", elections);
      res.render("action", {actionInfo: everything});
    })
  })

};
