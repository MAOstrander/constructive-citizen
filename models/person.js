'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('person',
  mongoose.Schema({
    email: String,
    fName: String,
    lName: String,
    dob: Date,
    address: String,
    city: String,
    state: String,
    zip: Number,
    canVote: Boolean
  })
);
