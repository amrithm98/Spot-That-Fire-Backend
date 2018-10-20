const VERIFY_DISTANCE_THRESHOLD = 5;
const calcDistance = require('./calcDistance.js');
const https = require('https');


module.exports = function(lat,long){
  return new Promise(function(resolve,reject){
  const URL = 'https://eonet.sci.gsfc.nasa.gov/api/v2.1/categories/8?status=open'
  https.get(URL,function(res){
    res.on('data',function(d){
      // var latitude = lat, longitude = long;
      var latitude = lat, longitude = long;
      const records = JSON.parse(d);
      console.log(records.events.length);
      for(var i=0;i<records.events.length;i++){
        ///amrith bro told to reverse lat and long
        var fireLat =records.events[i].geometries[0].coordinates[1], fireLong = records.events[i].geometries[0].coordinates[0];
        if(calcDistance(latitude,longitude,fireLat,fireLong)<= VERIFY_DISTANCE_THRESHOLD){
          console.log("SPOTTED IT!");
          console.log(records.events[i].title);
          console.log(records.events[i].geometries[0]);
          resolve(true);
        }else{
          resolve(false);
        }

        
      }
      // console.log("yes"+i);
    });
  }).on('error',function(e){
    // return e;
    reject(e);
  });
});
}
