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

router.post('/fireLoc',(req,res,next) => {
  firebase.database().ref('fire_loc/'+ req.body.lat + req.body.long).set({
    lat: req.body.lat,
    long :req.body.long,
    isVerified:false,
    isOpen:true,
    openDate:"12/12/12",
    closeDate:"1/1/1/",
    discription:"test discp",
    imgPath:"test/path",

  });
  res.json({
    "Sucess":"Success"
  })

});



module.exports = router;