'use strict';

const request = require('request');
const API = require('../API') // Anyone cloning this will need their own API-Key

module.exports.display = (req, res) => {
  res.render('action');
};

module.exports.getInfo = (req, res) => {
  res.render('action');
};
