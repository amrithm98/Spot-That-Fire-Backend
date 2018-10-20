const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const axios = require('axios');

const peopleVerified = require('../../../middlewares/peopleVerified.js');

router.post('/getLocDetails',(req,res) =>{
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    
    var result = {"country":country,"state":state,"district":district};
    console.log(response.data.address);
    console.log(result);
    return res.json(result);
  }).catch(err=>{

  });
});

router.post('/reportFire',(req,res,next) => 
{
 axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);
    
    var d = new Date();
    firebase.database().ref('fire_loc/'+ country +"/"+ state +"/"+ district +"/"+req.body.phone).set({
      lat: req.body.lat,
      long :req.body.long,
      isVerified:false,
      isOpen:true,
      openDate:new Date(Date.now()).toLocaleString(),
      closeDate:"1/1/1/",
      description:req.body.description,
      imgPath:req.body.path,
      threatLevel : 0,
      country:country,
      district:district,
      state:state

    },(err)=>{
      if(err)
      {
        debug(err);
        res.json({"success":false});
      }
      else {
        // var x = peopleVerified(req.body.lat,req.body.long);
        peopleVerified(req.body.lat,req.body.long).then(function(result){
        
        if(result["success"]){
          //mark verified
          console.log("if keri");
          console.log(result["snapshot"].val());
          var snapshot = result["snapshot"];
          for(var phone in snapshot.val()){
            //
            firebase.database().ref('fire_loc/'+ country +"/"+ state +"/"+ district +"/"+phone).update({
              isVerified:true
            },(err)=>{
              if(err){
                console.log(err);
                reject(err);
              }
              else{ 
                console.log("successfully updated isverified")
                // res.json({  "Success":"successfully updated verified"});
              };
            });
            // resolve(true);

          };    
          
        }
       })
       .then(function(result){
        res.json({  "Success":"successfully updated verified"});
       })
       .catch(error => {
        console.log(error);
        res.json({"Error":err});
        
      });   
    }
  });   
  })
  .catch(error => {
    console.log(error);
    res.json({"Error":err});
    
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