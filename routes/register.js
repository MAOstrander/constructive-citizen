'use strict';
const express = require('express');
const passport = require('passport');
const router = express.Router();

const ctrl = require('../controllers/register');

router.get('/register', ctrl.form);
router.post('/register', ctrl.signup);
router.delete('/login', ctrl.signout);
router.post('/login', passport.authenticate('local',
    {
      successRedirect: '/profile',
      failureRedirect: '/register'
    }
  ));


module.exports = router;
