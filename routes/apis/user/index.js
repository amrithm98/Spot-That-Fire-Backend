const express = require('express')
const app = express()
const debug = require('debug')('index')
const router = express.Router()
const firebase = require('firebase');
const firebaseConfig = require('../../../firebaseConfig.js');
const axios = require('axios');

router.post('/signup',(req,res,next) => {
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat='+req.body.lat+'&lon='+req.body.long+'&zoom=20')
  .then(response => {
    var country=response.data.address.country;
    var state=response.data.address.state;
    var district=response.data.address.state_district ||response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb ||response.data.address.village ||response.data.address.county;
    console.log(response.data.address);
    
    var d = new Date();
    firebase.database().ref('users/'+ country +"/"+ state +"/"+district+"/"+req.body.phone).set(
      {
            lat: req.body.lat,
            long :req.body.long,
            openDate:new Date(Date.now()).toLocaleString(),
            name : req.body.name,
            phone : req.body.phone,
            country : country,
            state: state,
            district : district
      },(err)=>
      {
        if(err)
        {
          debug(err);
          res.json({"success":false});
        }
        else 
          res.json({  "success": true}) 
  });
    
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router