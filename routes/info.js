'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/info');

router.get('/info', ctrl.go);

module.exports = router;
