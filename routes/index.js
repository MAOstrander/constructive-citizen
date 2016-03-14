'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

const findrep = require('./findrep');
const register = require('./register');


router.use(findrep);
router.use(register);


module.exports = router;
