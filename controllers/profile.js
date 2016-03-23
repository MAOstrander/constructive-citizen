'use strict';

const findrep = require('./findrep');

module.exports.dashboard = (req, res) => {

  var dashReps = new Promise( (resolve, reject) => {
      findrep.findFromDatabase(req, res, resolve);
    });

  dashReps.then( dashRepsResponse => {
      console.log("YAY", dashRepsResponse);
    }
  );


  res.render('profile');
};
