'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/register');

router.get('/register', ctrl.form);
router.post('/register', ctrl.signup);


module.exports = router;
