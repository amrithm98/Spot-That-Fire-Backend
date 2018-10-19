const express = require('express');
const debug = require('debug')('index');
const router = express.Router();

router.get('/',(req,res,next) => {
    res.send("SPOT THAT FIRE BRO!!!");
});

router.use('/auth',require('./auth'));
router.use('/apis',require('./apis'));

module.exports = router;
