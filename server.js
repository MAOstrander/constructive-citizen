'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const request = require('request');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const methodOverride = require('method-override');
const app = express();

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'iamabanana';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_PORT = process.env.MONGODB_PORT || 27017;
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASS = process.env.MONGODB_PASS || '';
const MONGODB_URL_PREFIX = MONGODB_USER ? `${MONGODB_USER}:${MONGODB_PASS}@`: '';

const MONGO_URL = `mongodb://${MONGODB_URL_PREFIX}${MONGODB_HOST}:${MONGODB_PORT}/civic-citizen`;
const routes = require('./routes/');

app.set('view engine', 'jade');

// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded( {extended: false} ) );
app.use(bodyParser.json() );

app.use(methodOverride('_method'));

app.use(session({
  secret: SESSION_SECRET,
  store: new RedisStore({url: REDIS_URL}),
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// app.use((req, res, next) => {
//   req.session.visits = req.session.visits || {};
//   req.session.visits[req.url] = req.session.visits[req.url] || 0;
//   req.session.visits[req.url]++;

//   next();
// });


app.use(routes);


mongoose.connect(MONGO_URL);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Node.js server started. Connected to Database. Listening on port ${PORT}`);
  });
});
