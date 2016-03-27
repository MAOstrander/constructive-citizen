'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('Reminder',
  mongoose.Schema({
    userID: Object,
    when: String,
    what: String,
    notes: String
  })
);
