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
const MONGODB_PORT = process.env.MONGODB_PORT || 27017;
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

app.get('/mayorfind', (req, res) => {
    res.render('findmayor');
});

app.post('/mayorfind', (req, res) => {
  console.log("Where is this going?", req.body);
  let searchTerms = req.body.address;
  const stateUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${searchTerms}&includeOffices=true&key=${API.civicKey}`

  request.get(stateUrl, (err, response, stateData) => {
    if (err) throw err;
    var parsedStateData = JSON.parse(stateData);

    var state = parsedStateData.normalizedInput.state;
    state = state.toLowerCase();

    var countyURL = `http://api.sba.gov/geodata/city_county_links_for_state_of/${state}.json`
    request.get(countyURL, (err, response, countyData) => {
    var parsedCountyData = JSON.parse(countyData);

    res.send(parsedCountyData);
    })

  })




  // const url = `https://www.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3Atn%2Fcounty%3Adavidson?key=${API.civicKey}`;
  // // const url = `https://www.googleapis.com/civicinfo/v2/representatives/ocd-division/country:us/state:tn/county:davidson?key=${API.civicKey}`;

  //   console.log("You searched");
  // request.get(url, (err, response, data) => {
  //   if (err) throw err;

  //   var parsedData = JSON.parse(data);


  // })
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
    let cd = parseInt( data.substr(cdIndex + 4, 2) );
    let congressOfficeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/cd:${cd}`].officeIndices[0];
    let congressOfficialIndex = parsedData.offices[congressOfficeIndex].officialIndices[0];
    const actualMember = parsedData.officials[congressOfficialIndex];
    actualMember.email = actualMember.emails ? actualMember.emails[0] : "Not Found";

    let stateOfficeIndices = parsedData.divisions[`ocd-division/country:us/state:${state}`].officeIndices;

    let stateOfficialIndices = [];
    let senatorIndices = [];
    let governorIndex;
    let mayorIndex;
    for (let i = 0; i < stateOfficeIndices.length; i++) {
      stateOfficialIndices[i] = parsedData.offices[stateOfficeIndices[i]];
      if (parsedData.offices[stateOfficeIndices[i]].name === "United States Senate") {
        senatorIndices = parsedData.offices[stateOfficeIndices[i]].officialIndices;
      } else if (parsedData.offices[stateOfficeIndices[i]].name === "Governor") {
        governorIndex = parsedData.offices[stateOfficeIndices[i]].officialIndices;
      } else if (parsedData.offices[stateOfficeIndices[i]].name === "Mayor") {
        mayorIndex = parsedData.offices[stateOfficeIndices[i]].officialIndices;
      }
    }

    const firstSenator = parsedData.officials[senatorIndices[0]];
    firstSenator.email = firstSenator.emails ? firstSenator.emails[0] : "Not Found";

    const secondSenator = parsedData.officials[senatorIndices[1]];
    secondSenator.email = secondSenator.emails ? secondSenator.emails[0] : "Not Found";

    const myGovernor = parsedData.officials[governorIndex];
    myGovernor.email = myGovernor.emails ? myGovernor.emails[0] : "Not Found";

    const myMayor = {};
    if (mayorIndex) {
      myMayor = parsedData.officials[mayorIndex];
      myMayor.email = myMayor.emails ? myMayor.emails[0] : "Not Found";
      myMayor.url = myMayor.urls ? myMayor.urls[0] : "Not Found";
    } else {
      myMayor.name = "Not Found";
      myMayor.url = "Not Found";
      myMayor.email = "Not Found";
      myMayor.photoUrl = "Not Found";
    }


    let slduIndex = data.indexOf('/sldu:')
    let sldu = parseInt( data.substr(slduIndex + 6, 2) );
    let stateSenateOfficeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/sldu:${sldu}`].officeIndices[0];
    let stateSenateOfficialIndex = parsedData.offices[stateSenateOfficeIndex].officialIndices[0];
    const stateLevelSenate = parsedData.officials[stateSenateOfficialIndex];
    stateLevelSenate.email = stateLevelSenate.emails ? stateLevelSenate.emails[0] : "Not Found";

    let sldlIndex = data.indexOf('/sldl:')
    let sldl = parseInt( data.substr(sldlIndex + 6, 2) );
    let stateHouseOfficeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/sldl:${sldl}`].officeIndices[0];
    let stateHouseOfficialIndex = parsedData.offices[stateHouseOfficeIndex].officialIndices[0];
    const stateLevelHouse = parsedData.officials[stateHouseOfficialIndex];
    stateLevelHouse.email = stateLevelHouse.emails ? stateLevelHouse.emails[0] : "Not Found";
    stateLevelHouse.url = stateLevelHouse.urls ? stateLevelHouse.urls[0] : "Not Found";


    const displayInfo = {
      state: {
        abbr: state,
        name: stateName
      },
      congressdistrict: cd,
      congressmember: actualMember,
      searchingforSenate: stateOfficeIndices,
      searchingforSenators: stateOfficialIndices,
      senator1: firstSenator,
      senator2: secondSenator,
      governor: myGovernor,
      divisions: parsedData.divisions,
      offices: parsedData.offices,
      officials: parsedData.officials,
      officials: parsedData.officials,
      everythingelse: parsedData
    };


    // const personsReps = new Myreps({
    const personsReps = {
      test: displayInfo,
      senator1: {
          name: firstSenator.name,
          website: firstSenator.urls[0],
          email: firstSenator.email,
          photo: firstSenator.photoUrl
      },
      senator2: {
          name: secondSenator.name,
          website: secondSenator.urls[0],
          email: secondSenator.email,
          photo: secondSenator.photoUrl
      },
      congressMember: {
          name: actualMember.name,
          website: actualMember.urls[0],
          email: actualMember.email,
          photo: actualMember.photoUrl
      },
      congressDistrict: cd,
      stateSenator: {
        name: stateLevelSenate.name,
        website: stateLevelSenate.urls[0],
        email: stateLevelSenate.email,
        photo: stateLevelSenate.photoUrl
      },
      stateSenateDistrict: sldu,
      stateHouse: {
        name: stateLevelHouse.name,
        website: stateLevelHouse.url,
        email: stateLevelHouse.email,
        photo: stateLevelHouse.photoUrl
      },
      stateHouseDistrict: sldl,
      governor: {
          name: myGovernor.name,
          website: myGovernor.urls[0],
          email: myGovernor.email,
          photo: myGovernor.photoUrl
      },
      mayor: {
          name: myMayor.name,
          website: myMayor.url,
          email: myMayor.email,
          photo: myMayor.photoUrl
      }
    };


    res.send(personsReps);
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
