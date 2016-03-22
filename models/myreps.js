'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('myreps',
  mongoose.Schema({
    userID: Object,
    senator1: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    senator2: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    congressMember: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    congressDistrict: Number,
    stateSenator: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    stateSenateDistrict: Number,
    stateHouse: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    stateHouseDistrict: Number,
    governor: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    mayor: {
      name: String,
      website: String,
      email: String,
      photo: String
    },
    address: {
      street: String,
      city: String,
      zip: Number,
      state: String,
      stateName: String,
      county: String
    }
  })
);
