'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/findrep');

router.get('/findrep', ctrl.initInput);

router.post('/findrep', ctrl.findFromSearch);


module.exports = router;
