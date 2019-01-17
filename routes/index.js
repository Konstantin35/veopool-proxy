const express = require('express');
const router = express.Router();
const Server = require('../modules/Stratum/Server');
const diffCheck = require('../modules/Stratum/diffCheck');
var server = new Server();
server.connect();
var job = null;



server.on('newwork', (nj)=>{
    job = nj;
})


router.post('/', (req, res)=>{
    console.log(req.body);
    res.send("ok");
});

router.post('/work', (req, res)=>{

})

router.get('/', (req, res)=>{
    
    res.json(job);
})

module.exports = router;