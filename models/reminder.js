'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('Reminder',
  mongoose.Schema({
    userID: Object,
    when: Date,
    what: String,
    notes: String
  })
);
