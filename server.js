'use strict';

const API = require('./API') // Anyone cloning this will need there own API-Key
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const app = express();

const Person = require('./models/person');
const Myreps = require('./models/myreps');

const PORT = process.env.PORT || 3000;
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_PORT = process.env.MONGODB_PORT || 27017; // eslint-disable-line no-magic-numbers
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASS = process.env.MONGODB_PASS || '';
const MONGODB_URL_PREFIX = MONGODB_USER ? `${MONGODB_USER}:${MONGODB_PASS}@`: '';

const MONGO_URL = `mongodb://${MONGODB_URL_PREFIX}${MONGODB_HOST}:${MONGODB_PORT}/civic-citizen`;

app.set('view engine', 'jade');

// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded( {extended: false} ) );
app.use(bodyParser.json() );

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/repfind', (req, res) => {
  res.render('find');
});

app.post('/repfind', (req, res) => {
  console.log("What did I type in?", req.body);

  // let searchTerms = '2317+Haskell+Drive';
  let searchTerms = req.body.address;
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${searchTerms}&includeOffices=true&key=${API.civicKey}`;

  request.get(url, (err, response, data) => {
    if (err) throw err;

    var parsedData = JSON.parse(data);

    let state = parsedData.normalizedInput.state;
    state = state.toLowerCase();
    let stateName = parsedData.divisions[`ocd-division/country:us/state:${state}`].name;

    let cdIndex = data.indexOf('/cd:')
    var cd = parseInt( data.substr(cdIndex + 4, 2) );
    let officeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/cd:${cd}`].officeIndices[0];
    let officialIndex = parsedData.offices[officeIndex].officialIndices[0];
    let actualMember = parsedData.officials[officialIndex];

    const displayInfo = {
      state: {
        abbr: state,
        name: stateName
      },
      congressdistrict: cd,
      congressmember: actualMember,
      divisions: parsedData.divisions,
      offices: parsedData.offices,
      officials: parsedData.officials,
      everythingelse: parsedData
    };

    const personsReps = new Myreps({
    senator1: {
        name: String,
        website: String,
        photo: String
    },
    senator2: {
        name: String,
        website: String,
        photo: String
    },
    congressMember: {
        name: actualMember.name,
        website: actualMember.urls[0],
        photo: actualMember.photoUrl
    },
    congressDistrict: cd,
    stateSenator: {
        name: String,
        website: String,
        photo: String
    },
    stateSenateDistrict: Number,
    stateHouse: {
        name: String,
        website: String,
        photo: String
    },
    stateHouseDistrict: Number,
    governer: {
        name: String,
        website: String,
        photo: String
    },
    mayor: {
        name: String,
        website: String,
        photo: String
    }
  });


    res.send(displayInfo);
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log("What was typed in? >>>>", req.body);
  const dob = new Date(req.body.byear, req.body.bmonth, req.body.bday);
  const now = new Date();
  // If the person is not a citizen or less than 18 they can't currently vote
  let canVote = req.body.citizen;
  if ((now - dob) < (18 * 365 * 24 * 60 * 60 * 1000)) {
    canVote = false;
  }

  const newPerson = new Person({
    email: req.body.email,
    fName: req.body.fName,
    lName: req.body.lName,
    dob: dob,
    address: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    canVote: canVote
  });

  console.log("newPerson", newPerson);
  // newPerson.save( (err) => {
  //   if (err) throw err;

    res.send(`Welcome ${newPerson.fName}`);
  // });

});


mongoose.connect(MONGO_URL);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Node.js server started. Connected to Database. Listening on port ${PORT}`);
  });
});
