const express = require('express');
const app = express();
const debug = require('debug')('verify');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('../../../firebaseConfig.js');
const https = require('https');

const calcDistance = require('../../../middlewares/calcDistance.js');
// firebase.initializeApp(firebaseConfig);
const VERIFY_COUNT_THRESHOLD = 5;
const VERIFY_DISTANCE_THRESHOLD = 5;




router.post('/victimCount',function(req,res){
  //add verified count
  var location = req.body.location;
  firebase.database().ref('fire_loc/'+location).once('value').then(function(snapshot){
    console.log(snapshot.val());
    var count = snapshot.numChildren();
    // console.log(count);
    if(count>= VERIFY_COUNT_THRESHOLD){
      res.send(200);
    }
    else{
      res.json({
        "Failure":"verified by less than 5"
      })
    }
  })
  .catch(function(){
    res.send(400);
  });
  // res.send(200);
  //if fire verified , post FIRE , NOTIFY PEOPLE
});

router.post('/verifiedPerson',function(req,res){
  //post FIRE, notify people
});

router.post('/inEONET',function(req,res){
  //post FIRE, notify people
  //console.log(calcDistance(8.5471,76.9139,8.5581,76.8816));
  const URL = 'https://eonet.sci.gsfc.nasa.gov/api/v2.1/categories/8?status=open'
  https.get(URL,function(res){
    res.on('data',function(d){
      // var latitude = req.body.latitude, longitude = req.body.longitude;
      var latitude= -123.551,longitude= 41.956;
      const records = JSON.parse(d);
      console.log(records.events.length);
      for(var i=0;i<records.events.length;i++){
        
        var fireLat =records.events[i].geometries[0].coordinates[0] , fireLong = records.events[i].geometries[0].coordinates[1];
        if(calcDistance(latitude,longitude,fireLat,fireLong)<= VERIFY_DISTANCE_THRESHOLD){
          console.log("SPOTTED IT!");
          console.log(records.events[i].title)
          console.log(records.events[i].geometries[0]);
        }
        
        
      }
      console.log("yes"+i);
    });
  }).on('error',function(e){
    return e;
  });

});

module.exports = router;
