'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

const info = require('./info');
const findrep = require('./findrep');
const register = require('./register');


router.use(info);
router.use(findrep);
router.use(register);


module.exports = router;
