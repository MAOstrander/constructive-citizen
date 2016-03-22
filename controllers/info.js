'use strict';

module.exports.go = (req, res) => {
  res.render('info');
};

module.exports.dashboard = (req, res) => {
  res.render('profile');
};
