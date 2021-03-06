'use strict';

const request = require('request');
if (process.env.API_KEY) {
  var API = {};
  API.civicKey = process.env.API_KEY;
} else {
  var API = require('../API') // Anyone cloning this will need their own API-Key
}
const Myreps = require('../models/myreps');
const Person = require('../models/person');

function apiSearch(searchTerms, req, res, resolve) {
  console.log("apiSearch Called");
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${searchTerms}&includeOffices=true&key=${API.civicKey}`;

    request.get(url, (err, response, data) => {
    if (err) throw err;

    var parsedData = JSON.parse(data);

    if (!parsedData.divisions) {
      resolve('nope');
      return;
    }

    // Find the state and state name
    let state;
    if (parsedData.normalizedInput.state) {
      state = parsedData.normalizedInput.state;
      state = state.toLowerCase();
    } else {
      let stateIndex = data.indexOf('us/state:');
      state = data.substr(stateIndex + 9, 2);
    }
    let stateName = parsedData.divisions[`ocd-division/country:us/state:${state}`].name;

    // Sanitize zip
    let myZip = "Not Found";
    if (parsedData.normalizedInput.zip) {
      myZip = parsedData.normalizedInput.zip
    }

    // Find the county
    let countyIndex = data.indexOf('/county:');
    let county = data.substr(countyIndex + 8, 22);
    county = county.split("\"")[0];
    if (county.indexOf("/") > 0) {
      county = county.substring(0, county.indexOf("/"));
    }
    let mayorOfficeIndices = [];
    if (parsedData.divisions[`ocd-division/country:us/state:${state}/county:${county}`]) {
      mayorOfficeIndices = parsedData.divisions[`ocd-division/country:us/state:${state}/county:${county}`].officeIndices; // list of county offices, in hopes of finding the mayor
    }

    // Find the Congressional District
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
      }
    }


    for (let i = 0; i < mayorOfficeIndices.length; i++) {
      if (parsedData.offices[mayorOfficeIndices[i]].name === "Metro Mayor" || parsedData.offices[mayorOfficeIndices[i]].name === "Mayor") {
        mayorIndex = parsedData.offices[mayorOfficeIndices[i]].officialIndices;
      }
    }

    const firstSenator = parsedData.officials[senatorIndices[0]];
    firstSenator.email = firstSenator.emails ? firstSenator.emails[0] : "Not Found";
    firstSenator.photoUrl = firstSenator.photoUrl ? firstSenator.photoUrl : "images/profile.png";

    const secondSenator = parsedData.officials[senatorIndices[1]];
    secondSenator.email = secondSenator.emails ? secondSenator.emails[0] : "Not Found";
    secondSenator.photoUrl = secondSenator.photoUrl ? secondSenator.photoUrl : "images/profile.png";

    const myGovernor = parsedData.officials[governorIndex];
    myGovernor.email = myGovernor.emails ? myGovernor.emails[0] : "Not Found";
    myGovernor.photoUrl = myGovernor.photoUrl ? myGovernor.photoUrl : "images/profile.png";

    let myMayor = {};
    if (mayorIndex) {
      myMayor = parsedData.officials[mayorIndex];
      myMayor.email = myMayor.emails ? myMayor.emails[0] : "Not Found";
      myMayor.url = myMayor.urls ? myMayor.urls[0] : "Not Found";
      myMayor.photoUrl = myMayor.photoUrl ? myMayor.photoUrl : "images/profile.png";
    } else {
      myMayor.name = "Not Found";
      myMayor.url = "Not Found";
      myMayor.email = "Not Found";
      myMayor.photoUrl = "images/profile.png";
    }

    let slduIndex = data.indexOf('/sldu:')
    let stateLevelSenate = {};
    let sldu;
    if (slduIndex > 0) {
      sldu = parseInt( data.substr(slduIndex + 6, 3) );
      let stateSenateOfficeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/sldu:${sldu}`].officeIndices[0];
      let stateSenateOfficialIndex = parsedData.offices[stateSenateOfficeIndex].officialIndices[0];
      stateLevelSenate = parsedData.officials[stateSenateOfficialIndex];
    } else {
      sldu = 0;
        stateLevelSenate.name = "Not Found";
    }
    stateLevelSenate.email = stateLevelSenate.emails ? stateLevelSenate.emails[0] : "Not Found";
    stateLevelSenate.url = stateLevelSenate.urls ? stateLevelSenate.urls[0] : "Not Found";
    stateLevelSenate.photoUrl = stateLevelSenate.photoUrl ? stateLevelSenate.photoUrl : "images/profile.png";

    let sldlIndex = data.indexOf('/sldl:')
    let stateLevelHouse = {};
    let sldl;
    if (sldlIndex > 0) {
      sldl = parseInt( data.substr(sldlIndex + 6, 3) );
      let stateHouseOfficeIndex = parsedData.divisions[`ocd-division/country:us/state:${state}/sldl:${sldl}`].officeIndices[0];
      let stateHouseOfficialIndex = parsedData.offices[stateHouseOfficeIndex].officialIndices[0];
      stateLevelHouse = parsedData.officials[stateHouseOfficialIndex];
    } else {
      sldu = 0;
      stateLevelHouse.name = "Not Found";
    }
    stateLevelHouse.email = stateLevelHouse.emails ? stateLevelHouse.emails[0] : "Not Found";
    stateLevelHouse.url = stateLevelHouse.urls ? stateLevelHouse.urls[0] : "Not Found";
    stateLevelHouse.photoUrl = stateLevelHouse.photoUrl ? stateLevelHouse.photoUrl : "images/profile.png";


    let userID = "Guest";
    if (res.locals.user) {
      userID = res.locals.user._id;
    }

    const personsReps = new Myreps({
      userID:  userID,
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
        website: stateLevelSenate.url,
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
      },
      address: {
        street: parsedData.normalizedInput.line1,
        city: parsedData.normalizedInput.city,
        zip: myZip,
        state: state,
        stateName: stateName,
        county: county
      }
    });

    if (userID !== "Guest") {
      Myreps.findOne({ userID: userID }, function (err, user) {
        if (err) throw err;

        if (user) {
          resolve(personsReps);
        } else {
          personsReps.save( (err) => {
            if (err) throw err;
            resolve(personsReps);
          });
        }
      });
    } else {
      resolve(personsReps);;
    }


  });
}

module.exports.initInput = (req, res) => {
  console.log("initInput Called");
  if (res.locals.user) {
    Myreps.findOne({ userID: res.locals.user._id }, function (err, user) {
      if (err) throw err;

      if (user) {
        res.render('find', {personsReps: user});
      } else {
        Person.findOne({ _id: res.locals.user._id }, function (err, person) {
          if (err) throw err;

          let searchTerms = `${person.address} ${person.city} ${person.state} ${person.zip}`;

          var reps = new Promise( (resolve, reject) => {
            apiSearch(searchTerms, req, res, resolve);
          });

          reps.then( val => {
            res.render('find', {personsReps: val});
          });

        });
      }
    });
  } else {
    res.render('find');
  }

};

module.exports.findSearchDisplay = (req, res) => {
    console.log("findSearchDisplay Called");
  let searchTerms = req.body.address;

  var reps = new Promise( (resolve, reject) => {
    apiSearch(searchTerms, req, res, resolve);
  });

  reps.then( val => {
    if (val === 'nope') {
      res.render('find', {message: "Invalid Address"});
    } else {
      res.render('find', {personsReps: val, message: "Scroll Down to See Results"});
    }
  });
};
