'use strict';
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const BCRYPT_DIFFICULTY = 11;

const PersonSchema = mongoose.Schema({
  email: String,
  password: String,
  fName: String,
  lName: String,
  dob: Date,
  address: String,
  city: String,
  state: String,
  zip: String,
  isCitizen: Boolean,
  overEighteen: Boolean,
  canVote: Boolean
});

PersonSchema.methods.authenticate = function (password, cb) {
  bcrypt.compare(password, this.password, cb);
}

PersonSchema.pre('save', function (next) {
  bcrypt.hash(this.password, BCRYPT_DIFFICULTY, (err, hash) => {
    if (err) throw err;

    this.password = hash;
    next();
  });
});

module.exports = mongoose.model('Person', PersonSchema);
