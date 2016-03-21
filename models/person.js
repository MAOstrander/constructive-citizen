'use strict';
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const BCRYPT_DIFFICULTY = 11;

// module.exports = mongoose.model('person',
//   mongoose.Schema({
//     email: String,
//     fName: String,
//     lName: String,
//     dob: Date,
//     address: String,
//     city: String,
//     state: String,
//     zip: Number,
//     canVote: Boolean
//   })
// );




const UserSchema = mongoose.Schema({
  email: String,
  password: String
});

UserSchema.methods.authenticate = function (password, cb) {
  bcrypt.compare(password, this.password, cb);
}

UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, BCRYPT_DIFFICULTY, (err, hash) => {
    if (err) throw err;

    this.password = hash;
    next();
  });
});

module.exports = mongoose.model('Users', UserSchema);
