const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('../../firebaseConfig.js');

firebase.initializeApp(firebaseConfig);



router.use('/user',require('./user'))
router.use('/fireLoc',require('./fire'));
router.use('/rehab',require('./rehab'));
router.use('/verify',require('./verify'));

module.exports = router;