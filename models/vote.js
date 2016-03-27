'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('Vote',
  mongoose.Schema({
    userID: Object,
    voterState: String,
    stateElectionInfo: String,
    localElectionInfo: String,
    registrationStatus: String,
    registrationToVote: String,
    whereToVote: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String
    },
    allElections: Object,
    elections: Object,
    stateElections: Object
  })
);
