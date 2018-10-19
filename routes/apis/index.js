const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('../../firebaseConfig.js');

firebase.initializeApp(firebaseConfig);


router.post('/signUp',(req,res,next) => {
  firebase.database().ref('users/'+ req.body.mobileNo).set({
    ssn: req.body.ssn,
  });
  res.json({
    "Sucess":"Success"
  })
});

router.use('/fireLoc',require('./fire'));
router.use('/rehabLoc',require('./rehabLoc'));

module.exports = router;