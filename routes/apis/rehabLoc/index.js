const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()


router.post('/',(req,res,next)=>{
    firebase.database().ref('rehab_loc'+req.body.lat+req.body.long).set({
        lat:req.body.lat,
        long:req.body.long,
        phoneNo:req.body.phoneNo
    },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
    res.json({
        "Success":"Success"
    })
})
module.exports = router