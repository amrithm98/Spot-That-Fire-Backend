const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()
const firebase = require('firebase');
const firebaseConfig = require('../../../firebaseConfig.js');
router.post('/signUp',(req,res,next) => {
  firebase.database().ref('users/'+ req.body.mobileNo).set({
    ssn: req.body.ssn,
  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
});

module.exports = router