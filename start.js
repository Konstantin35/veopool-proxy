#!/usr/bin/env node

var app = require('./app');
// var debug = require('debug')('tradinginterface: server');
var http = require('http');
const fs = require('fs');


var conf = null;

if (fs.existsSync("server.conf")){
    let tmp = fs.readFileSync("server.conf");
    conf = JSON.parse(tmp);
}
else {
    conf = {port: 8880};
    fs.writeFileSync("server.conf", JSON.stringify(conf));
}

var httpServer = http.createServer(app);
httpServer.listen(conf.port);
