const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()
const firebase = require('firebase')
const axios = require('axios');


router.post('/addrehab',(req,res,next)=>{
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);
    
    // var d = new Date(); how to make the rehabID ??? or replace it with name
    firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district ).push({
      lat: req.body.lat,
      lng :req.body.long,
      regDate:new Date(Date.now()).toLocaleString(),
      description:req.body.description,
      imgPath:req.body.path,
      country:country,
      address: req.body.address,
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
  var rehabID = req.body.rehabID ;
  // console.log('rehab_info/'+ country +"/"+ state +"/"+ district +"/"+rehabID);
  
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);

    firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district +"/"+rehabID).once('value').then(function(snapshot){
    // console.log(snapshot.val());
    var count = snapshot.numChildren();
    // console.log(count);a
    res.json(snapshot.val());
    });
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
      var lat,lng,desc;
    // //for loop to get all ids and coordinates
      for (var rehab in snapshot.val()[district]){
        // console.log(rehab);
        // console.log(snapshot.val()[district][rehab].lat);
        lat = snapshot.val()[district][rehab].lat;
        lng = snapshot.val()[district][rehab].lng;
        desc = snapshot.val()[district][rehab].description;
        result[rehab] = {lat,lng,desc};
      }

    }
    res.json(result);
  })
  .catch(function(){
    res.send(400);
  });
});


router.post('/getDistrict',function(req,res){

  // var {country,state,district} = req.body ;
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);

    firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district ).once('value').then(function(snapshot){

      var count = snapshot.numChildren(); // count venongi
      var result = [];
      var lat,lng,desc,address;
      
      //for loop to get all ids and coordinates

      snapshot.forEach(function(data){
        // console.log("The " + data.key + " lat,long is " + data.val().lat +" "+ data.val().long);
        
        lat = data.val().lat;
        lng = data.val().lng;
        desc = data.val().description;
        address = data.val().address;

        var info = {};
        info['lat'] = lat;
        info['lng'] = lng;
        info['desc'] = desc;
        info['address'] = address;
        info['key'] = data.key;
        result.push(info);
      });
      debug(result);
      res.json(result);
    })
    
  }).catch(function(){
    res.send(400);
  });
  
});




module.exports = router