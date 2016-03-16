'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/action');

router.get('/action', ctrl.display);

router.post('/action', ctrl.getInfo);


module.exports = router;
