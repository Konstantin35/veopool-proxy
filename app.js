
const express = require('express');
const logger = require('morgan');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: ''
  });
  

const Server = require('./modules/Stratum/Server');
var server = new Server("stratum.veopool.pw", 8086);
var job = null;
var work = null;
server.on('newwork', (nj)=>{
    
    work = ['ok',[-6, nj.bHash, nj.jDiff, nj.jDiff, "stratum+tcp://stratum.veopool.pw:8086"]]
    job = nj;
})
server.connect();

const diffCheck = require('./modules/Stratum/diffCheck');

const indexRouter = require('./routes/index');

const foundBlock = "[-6,102,111,117,110,100,32,98,108,111,99,107]";
//[-6,102,111,117,110,100,32,119,111,114,107]
const foundWork = "[-6,102,111,117,110,100,32,119,111,114,107]";
const lowDiff = "[-6,108,111,119,32,100,105,102,102]";
const invalidWork = "[-6,105,110,118,97,108,105,100,32,119,111,114,107]";


var workData = (data, cb) => {
    let result = data.replace(/'/g, "\"");
    result = result.split(',');
    process.nextTick(()=>{
        cb(result);
    })
};
function workData2(data){
    let result = data.replace(/'/g, "\"");
    result = result.split(',');
    return result;
}

const handleGetWork = (req)=>{
    // console.log("worksubmit")
        let data = req.body;
        data = String(data);
        let result = null;
        let temp = workData2(data);
        result = {params: {
            id: temp[2],
            nonce: temp[1]
        }}
        return server.newGetWorkSubmit(result);
}

var dev = false;
var verbose = false;

for (var i = 0; i<process.argv.length; i++){
    switch (process.argv[i]){
        case "dev":
            dev = true;
            break;
        case "verbose":
            verbose = true;
            break;
        case "nodevfee":
            server.nodevfee = true;
            break;
    }
}


const app = express();
app.use(express.json({type: '*/*', limit: "250kb"}));
if (dev){
    app.use(logger('dev'));
}
else {
    app.use(logger('combined', {stream: accessLogStream}));
}



app.get('/', (req, res)=>{
    job.stratum = "stratum+tcp://stratum.veopool.pw:8086"
    res.json(job);
})

app.post('/', (req, res)=>{
    if (req.body.indexOf("mining_data")>-1){
        req.body.result = JSON.stringify(work)+"\n";
    }
    else if (req.body.indexOf("work")>-1){
        
        let validity = handleGetWork(req);
        req.body.result = (validity > 0 ? foundWork : invalidWork);
    }

    res.headers = {
        contentType: 'application/json',
    };
    if (req.body.result){
        res.send(req.body.result);
    }
    else {
        res.status(500).send();
    }
    // res.send("ok");
})
app.post('/work', (req, res)=>{
    if (req.body.indexOf("mining_data")>-1){
        req.body.result = JSON.stringify(work)+"\n";
    }
    else if (req.body.indexOf("work")>-1){
        let validity = handleGetWork(req);
        req.body.result = (validity > 0 ? foundWork : invalidWork);
    }
    res.headers = {
        contentType: 'application/json',
    };
    if (req.body.result){
        res.send(req.body.result);
    }
    else {
        res.status(500).send();
    }
})

module.exports = app;