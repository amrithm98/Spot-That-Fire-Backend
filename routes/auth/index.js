const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();
const Sendotp = require('sendotp')
const sendOtp = new Sendotp('243627AqoWc8HWwq5bcab24a')

router.get('/',(req,res,next) => {
    res.send("Welcome to RPMCARE-AUTH!");
});
router.post('/getOTP',(req,res,next)=>{
    const mobileNo = req.body.mobileNo
    const senderId = "FAlert"
    const otp = Math.floor(1000 + Math.random() * 9000);
    sendOtp.send(mobileNo, senderId,otp, function (error, data) {
      console.log(data);
});
})
router.post('/verifyOTP',(req,res,next)=>{
    const mobileNo = req.body.mobileNo
    const otp = req.body.otp
    sendOtp.verify(mobileNo, otp, function (error, data) {
 // data object with keys 'message' and 'type'
        if(data.type == 'success') res.json({"Success":true})
        if(data.type == 'error') res.json({"Success":false   })
});
})

module.exports = router;