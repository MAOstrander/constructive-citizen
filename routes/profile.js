'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/info');

router.get('/profile', ctrl.dashboard);

module.exports = router;
