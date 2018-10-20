const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const axios = require('axios');


router.post('/',(req,res,next) => {
 axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);
    
    var d = new Date();
    firebase.database().ref('fire_loc/'+ country +"/"+ state +"/"+ district +"/"+req.body.userId).set({
      lat: req.body.lat,
      long :req.body.long,
      isVerified:false,
      isOpen:true,
      openDate:new Date(Date.now()).toLocaleString(),
      closeDate:"1/1/1/",
      discription:req.body.discription,
      imgPath:req.body.path,
      threatLevel : 0,
      country:country,
      district:district,
      state:state

  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
    
  })
  .catch(error => {
    console.log(error);
  });


});

router.get('/getAll',(req,res,next)=>{
  var allFireRef=firebase.database().ref('fire_loc');
  allFireRef.once('value',function(snap){
    res.json(snap.val());
  });
});

router.post('/notify',(req,res)=>{
  
});

router.post('/verify',(req,res)=>{
  var fireRef=firebase.database().ref('fire_loc/'+req.body.lat+":"+req.body.long);
  fireRef.update({
    isVerified:true
  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
});

router.post('/close',(req,res)=>{
  var fireRef=firebase.database().ref('fire_loc/'+req.body.lat+":"+req.body.long);
  fireRef.update({
    isOpen:false,
    closeDate:new Date(Date.now()).toLocaleString()

  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });

});

router.post('/changeThreat',(req,res)=>{
  var fireRef=firebase.database().ref('fire_loc/'+req.body.lat+":"+req.body.long);
  fireRef.update({
    threatLevel:req.body.newThreatLevel
  },(err)=>{
    if(err)
      res.json({"Error":err})
    else 
      res.json({  "Success":"success"}) 
  });
});



module.exports = router;