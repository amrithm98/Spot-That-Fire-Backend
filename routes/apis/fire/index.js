const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');


router.post('/',(req,res,next) => {
  var d = new Date();
  firebase.database().ref('fire_loc/'+ req.body.lat + req.body.long).set({
    lat: req.body.lat,
    long :req.body.long,
    isVerified:false,
    isOpen:true,
    openDate:new Date(Date.now()).toLocaleString(),
    closeDate:"1/1/1/",
    discription:req.body.discription,
    imgPath:req.body.path,

  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });

});



module.exports = router;