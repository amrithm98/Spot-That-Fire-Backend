const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()

router.post('/signUp',(req,res,next) => {
  firebase.database().ref('users/'+ req.body.mobileNo).set({
    ssn: req.body.ssn,
  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
  res.json({
    "Sucess":"Success"
  })
});

module.exports = router