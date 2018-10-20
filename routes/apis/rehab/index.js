const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()
const firebase = require('firebase')
const axios = require('axios');


router.post('/',(req,res,next)=>{
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);
    
    // var d = new Date(); how to make the rehabID ??? or replace it with name
    firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district ).push({
      lat: req.body.lat,
      long :req.body.long,
      regDate:new Date(Date.now()).toLocaleString(),
      description:req.body.description,
      imgPath:req.body.path,
      country:country,
      state:state,
      district:district,
      amentiesData:req.body.stockData
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
  var allRehab=firebase.database().ref('rehab_info');
  allRehab.once('value',function(snap){
    // console.log(Object.keys(snap.val()));    
    res.json(snap.val());
  });
});

router.post('/getSpecific',function(req,res){
  var {country,state,district,rehabID} = req.body ;
  // console.log('rehab_info/'+ country +"/"+ state +"/"+ district +"/"+rehabID);
  
  firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district +"/"+rehabID).once('value').then(function(snapshot){
    // console.log(snapshot.val());
    var count = snapshot.numChildren();
    // console.log(count);
    res.json(snapshot.val());
  })
  .catch(function(){
    res.send(400);
  });
});

//under development
router.post('/getCountry',function(req,res){
  var {country} = req.body ;

  firebase.database().ref('rehab_info/'+ country ).once('value').then(function(snapshot){

    var count = snapshot.numChildren();
    // console.log(count);

    //for loop to get all ids and coordinates
    res.json({
      "state":"under-development"
    });
  })
  .catch(function(){
    res.send(400);
  });
});

router.post('/getState',function(req,res){
  
  var {country,state} = req.body ;

  firebase.database().ref('rehab_info/'+ country +"/"+ state ).once('value').then(function(snapshot){

    var result = {};
    
    //for loop to get all ids and coordinates
    for (var district in snapshot.val()){
      var lat,long,desc;
    // //for loop to get all ids and coordinates
      for (var rehab in snapshot.val()[district]){
        // console.log(rehab);
        // console.log(snapshot.val()[district][rehab].lat);
        lat = snapshot.val()[district][rehab].lat;
        long = snapshot.val()[district][rehab].long;
        desc = snapshot.val()[district][rehab].description;
        result[rehab] = {lat,long,desc};
      }

    }
    res.json(result);
  })
  .catch(function(){
    res.send(400);
  });
});


router.post('/getDistrict',function(req,res){

  var {country,state,district} = req.body ;
  
  firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district ).once('value').then(function(snapshot){

    var count = snapshot.numChildren(); // count venongi
    var result = {};
    var lat,long,desc;
    
    //for loop to get all ids and coordinates
    snapshot.forEach(function(data){
      // console.log("The " + data.key + " lat,long is " + data.val().lat +" "+ data.val().long);
      lat = data.val().lat;
      long = data.val().long;
      desc = data.val().description;
      result[data.key] = {lat,long,desc};
    });
    res.json(result);
  })
  .catch(function(){
    res.send(400);
  });
});




module.exports = router