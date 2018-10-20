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
    
    // var d = new Date(); how to make the rehabID ??? 
    firebase.database().ref('rehab_info/'+ country +"/"+ state +"/"+ district +"/"+req.body.rehabID).set({
      lat: req.body.lat,
      long :req.body.long,
      regDate:new Date(Date.now()).toLocaleString(),
      description:req.body.description,
      imgPath:req.body.path,
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
    res.json(snap.val());
  });
});


module.exports = router