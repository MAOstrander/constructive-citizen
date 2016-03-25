'use strict';
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/profile');

router.get('/profile', ctrl.dashboard);
router.put('/edit-address', ctrl.changeAddress);
router.put('/add-reminder', ctrl.addReminder);

module.exports = router;
