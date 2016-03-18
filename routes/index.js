'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

const action = require('./action');
const findrep = require('./findrep');
const info = require('./info');
const register = require('./register'); // Also Login

router.use(action);
router.use(findrep);
router.use(info);
router.use(register);


module.exports = router;
