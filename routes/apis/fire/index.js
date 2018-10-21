const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const firebase = require('firebase');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase.json');

const peopleVerified = require('../../../middlewares/peopleVerified.js');
const nasaVerified = require('../../../middlewares/eonetVerified.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://spot-that-fire-nsac.firebaseio.com"
});
// See documentation on defining a message payload.
var message = {
    notification: {
        title: "WildFire Alert",
        body: "A WildFire has been reported in a region near you"
    },
    topic: "Thiruvananthapuram"
};

function sendPush(topic)
{
    console.log("SENDING NOTIFICATION to "+ topic);
    // console.log(message);
    message.topic = topic;
    // Send a message to devices subscribed to the provided topic.
    admin.messaging().send(message).then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    }).catch((error) => {
        console.log('Error sending message:', error);
    });
}

var updateIsVerified = function (snapshot, country, state, district) {
  return new Promise(function (resolve, reject) {
    var count = snapshot.numChildren();
    var i = 0;
    console.log("Hello")
    for (var phone in snapshot.val()) {
      //
      firebase.database().ref('fire_loc/' + country + "/" + state + "/" + district + "/" + phone).update({
        isVerified: true
      }, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        else {
          i++;
          // console.log("successfully updated isverified");
          if (i >= count) {
            console.log("successfully completed updating isverified");
            resolve(true);
          }
          // res.json({  "Success":"successfully updated verified"});
        };
      });
    };
    // resolve(false);

  });
};

router.post('/getLocDetails', (req, res) => {
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat=' + req.body.lat + '&lon=' + req.body.long + '&zoom=20')
    .then(response => {
      var country = response.data.address.country;
      var state = response.data.address.state;
      var district = response.data.address.state_district || response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb || response.data.address.village || response.data.address.county;

      var result = { "country": country, "state": state, "district": district };
      console.log(response.data.address);
      console.log(result);
      return res.json(result);
    }).catch(err => {

    });
});

router.post('/reportFire', (req, res, next) => {
  axios.get('https://nominatim.openstreetmap.org/reverse.php?format=jsonv2&lat=' + req.body.lat + '&lon=' + req.body.long + '&zoom=20')
    .then(response => {
      var country = response.data.address.country;
      var state = response.data.address.state;
      var district = response.data.address.state_district || response.data.address.city_district || response.data.address.neighbourhood || response.data.address.suburb || response.data.address.village || response.data.address.county;
      // console.log(response.data.address);

      var d = new Date();
      firebase.database().ref('fire_loc/' + country + "/" + state + "/" + district + "/" + req.body.phone).set({
        lat: req.body.lat,
        lng: req.body.long,
        isVerified: false,
        isOpen: true,
        openDate: new Date(Date.now()).toLocaleString(),
        closeDate: "1/1/1/",
        description: req.body.desc,
        imgPath: req.body.path,
        threatLevel: 0,
        country: country,
        district: district,
        state: state

      }, (err) => {
        if (err) {
          debug(err);
          return res.json({ "success": false });
        }
        else {
          //VERIFICATION BY PEOPLE
          peopleVerified(req.body.lat, req.body.long).then(function (result) {
            var snapshot = result["snapshot"];

            if (result["success"]) {
              //mark verified
              console.log("people Verified TRUE, need to update isverified");

              updateIsVerified(snapshot, country, state, district).then(function (result) {
                //error illa
                console.log("RESULT:"+result);
                if(result === true){
                  console.log("completed");
                  sendPush(district);
                return res.json({ "Success": "people verified TRUE, isverified updated" });
                }
                // else{
                //   return snapshot;
                // }
              }).catch(function(err){
                console.log(err)
              });

            }
            else if (result["success"] === false) {
              console.log("people verification NOT 5 YET");
              // resolve(result["snapshot"]);
              // console.log(snapshot.val());
              return snapshot;
            }
            // return snapshot;
          })
            .then(function (snapshot) {
              if(snapshot!=null){
              // console.log(snapshot.val());
              nasaVerified(req.body.lat, req.body.long).then(function (result) {
                if (result) {
                  console.log("NASA verification TRUE");
                  updateIsVerified(snapshot, country, state, district).then(function (result) {
                    //error illa
                    if(result === true)
                    {
                      sendPush(district);
                      return res.json({ "Success": "NASA verified, isverified updated" });

                    }
                  })
                  .catch(function(e){
                    console.log("yeah");  
                  });
                  //isverify true
                } else {
                  console.log("NASA verification FALSE");
                  return res.json({ "Success": "added report, not in nasa, not 5 verified req yet." });
                }
              }).catch(function(error){
                console.log("IVDEEE1");
                console.log(error);
              });
            }
        })  
            .catch(error => {
              console.log("IVDEEE2");
              
              console.log(error);
              // res.json({ "Error": err });

            });
        }
      });
    })
    .catch(error => {
      console.log("IVDEEE3");
      
      console.log(error);
      // res.json({ "Error": err });

    });
});

router.get('/getAll', (req, res, next) => {
  var allFireRef = firebase.database().ref('fire_loc');
  allFireRef.once('value', function (snap) {
    res.json(snap.val()); 
  });
});

router.post('/notify', (req, res) => {

});

router.post('/verify', (req, res) => {
  var fireRef = firebase.database().ref('fire_loc/' + req.body.lat + ":" + req.body.long);
  fireRef.update({
    isVerified: true
  }, (err) => {
    if (err)
      res.json({ "Error": err })
    else
      res.json({ "Success": "success" })
  });
});

router.post('/close', (req, res) => {
  var fireRef = firebase.database().ref('fire_loc/' + req.body.lat + ":" + req.body.long);
  fireRef.update({
    isOpen: false,
    closeDate: new Date(Date.now()).toLocaleString()

  }, (err) => {
    if (err)
      res.json({ "Error": err })
    else
      res.json({ "Success": "success" })
  });

});

router.post('/changeThreat', (req, res) => {
  var fireRef = firebase.database().ref('fire_loc/' + req.body.lat + ":" + req.body.long);
  fireRef.update({
    threatLevel: req.body.newThreatLevel
  }, (err) => {
    if (err)
      res.json({ "Error": err })
    else
      res.json({ "Success": "success" })
  });
});



module.exports = router;