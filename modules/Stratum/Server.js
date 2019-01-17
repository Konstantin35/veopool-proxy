const net = require('net');
const EventEmitter = require('events');
const shid = require('shortid');
const getLogger = require('../Util/Logger');

const myid = 'BI6PuRnjBCVGeBu6Pg0DGw5sy/adVDqaiS7d/O3VUFFlkE7uD6ozgLWD+OXS5AWCrIcndzu/b/KNMzxVy2loUFA=.farmproxy';

class Server extends EventEmitter{
    constructor(server, port, sport=8086){
        super();
        this.setMaxListeners(1000);
        this.server = server;
        this.port = port;
        this.sport = sport;
        this.pool = new net.Socket();
        this.id = "Proxy-"+shid.generate();
        this.logger = getLogger();
        this.jobs = new Map();
        this.jobIds = [];
        this.currentJobId = null;
        this.serverSocket = null;

        this.work = null;

        this.workLoad = [];

        this.clients = new Map();
        this.checkNonce = require('./diffCheck');

        this.verbose = true;
        this.logger.setFlag('c');
    }
    reconnect(){
        this.pool = new net.Socket();
        this.connect();
    }

    connect(){
        this.pool.connect(this.port, this.server, ()=>{
            this.logger.log("Connected to Pool at "+ this.server);
            this.subscribe();
        });
        this.pool.on('data', (data)=>{
            // this.logger.logToConsole(data);
            this.handlePoolMessage(data);
        })
        this.pool.on('error', (err)=>{
            this.pool = new net.Socket();
            this.connect();
        });
        this.pool.on('end', ()=>{
            this.pool = new net.Socket();
            this.connect();
        })
    }

    async handlePoolMessage(message){
        this.logger.log("PM: "+message);
        try {
            let data = JSON.parse(message);
            if (data.id){
                console.log("share answer");
            }
            else {
                let job = {
                    bHash: data.result.bHash,
                    diff: data.result.diff,
                    jDiff: data.result.jDiff,
                };
                this.work=job;
                this.jobs.set(data.jId, job);
                this.currentJobId = data.jId;
                this.jobIds.push(this.currentJobId);
                this.emit('newwork', job);
                if (this.jobs.size>10){
                    let old = this.jobIds[0];
                    this.jobIds.splice(0, 1);
                    this.jobs.delete(old);
                }
            }
            
        }
        catch (err){
            console.error(err);
            this.reconnect();
        }
    }

    subscribe(){
        
        var data = {
            method: 0,
            id: 1,
            params: {
                id: myid
            }
        };
        this.pool.write(JSON.stringify(data));
    }

    disconnect(){
        this.pool.end();
    }

    //getters
    getId(){
        return this.id;
    }

    //testMethods

    async logInterval(){
        setInterval(()=>{
            if (this.jobs.size > 0){
                let val = this.jobs.get(this.currentJobId);
                this.logger.log("jobId: "+ this.currentJobId + " Work: "+val.bHash);
            }
            else {
                this.logger.log("No Job yet");
            }
        }, 5000);
    }

   

    async handleClientMessage(data, socket){
        let msg = null;
        try {
            msg = JSON.parse(data);
            // console.log(msg);
            switch (msg.method){
                case 0:
                    this.subscribeClient(msg.params, socket);
                    break;
                case 1:
                    this.newWork(msg, socket);
                    break;
                case 2:
                    console.log("2: ->"+data+" from Client \n")
                    break;
            }
        }
        catch (err){
            this.logger.log(err);
            if (err.stack && this.verbose === true){
                this.logger.log(err.stack);
            }
        }
    }
   
    sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async sendWorkToPool(work){
        await this.sleep(35);
        this.pool.write(JSON.stringify(work));
    }
    newWork(work, socket){
        
       
        let nonce = work.params.nonce;
        let job = this.work
        let validity = this.checkNonce(nonce, job.bHash, job.diff, job.jDiff);
        
        let work2 = {id: 2, method: 1, params: {id: work.params.id, nonce: nonce}};
        this.sendWorkToPool(work2);
        if (validity>0){
            socket.write(JSON.stringify({ id: 2, result: { acc: 1 } })+"\n");
        }
        else {
            socket.write(JSON.stringify({id: 2, error: {code: 23, message: "low diff"}})+"\n");
        }

    }

    newGetWorkSubmit(work){
        let nonce = work.params.nonce;
        let job = this.work;
        let validity = this.checkNonce(nonce, job.bHash, job.diff, job.jDiff);
        if (this.dev){
            this.logger.log("valid share");
        }
        
        let work2 = {id: 2, method: 1, params: {id: work.params.id, nonce: nonce}};
        this.pool.write(JSON.stringify(work2));
        if (validity>0){
            return 1;
        }
        else {
            return 0;
        }
    }

}

module.exports = Server;