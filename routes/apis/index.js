const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('../../firebaseConfig.js');

firebase.initializeApp(firebaseConfig);


router.post('/signUp',(req,res,next) => {
  firebase.database().ref('users/'+ req.body.mobileNo).push({
    ssn: req.body.ssn,
  });

});

router.get('/fireLoc',(req,res,next) => {
  firebase.database().ref('fire_loc/'+ req.body.lat + req.body.long).push({
    lat: req.body.lat,
    long :req.body.long,

  });

});



module.exports = router;