'use strict';

const express = require('express');
const app = express();
const API = require('./API') // Anyone cloning this will need there own API-Key
const request = require('request');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(bodyParser.urlencoded( {extended: false} ) );
app.use(bodyParser.json() );

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', (req, res) => {
  console.log("What did I type in?", req.body);

  // let searchTerms = '2317+Haskell+Drive';
  let searchTerms = req.body.address;
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${searchTerms}&includeOffices=true&key=${API.civicKey}`;

  request.get(url, (err, response, data) => {
    if (err) throw err;

    res.send(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Node.js server started. Listening on port ${PORT}`);
});
