'use strict';

const API = require('./API') // Anyone cloning this will need there own API-Key
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const app = express();

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

    res.send(JSON.parse(data));
  });
});


mongoose.connect(MONGO_URL);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Node.js server started. Connected to Database. Listening on port ${PORT}`);
  });
});
