const express = require('express');
const app = express();
const debug = require('debug')('index');
const router = express.Router();

router.get('/',(req,res,next) => {
    res.send("Welcome to RPMCARE-AUTH!");
});


module.exports = router;