const EventEmitter = require('events');
const fs = require('fs');
const Slimbot = require('slimbot');
const BotID = '712116233:AAEWFahncQ50qIgoTgvApYyAJuAVWrw_5zg';
const chatId = '-306506919';

class Logger extends EventEmitter{
    constructor(){
        super();
        this.flag = 'f';
        this.bot = new Slimbot(BotID);
        
    }
    logToFile(data){
        let prefix = "["+new Date().toLocaleTimeString()+"]: ";
        let suffix = "--------\r\n";
        let filename = new Date().toDateString()+".log";
        fs.appendFile("../../"+filename, ""+prefix+data+suffix, (err)=>{
            console.log(err);
        })
    }
    logToConsole(data){
        let prefix = "["+new Date().toLocaleTimeString()+"]: ";
        console.log(""+prefix+data+"\r\n");
    }
    logToTelegram(data){
        let prefix = "["+new Date().toLocaleTimeString()+"]: ";
        let suffix = "\r\n";
        this.bot.sendMessage(chatId, ""+prefix+data+suffix);
    }
    log(data){
        if (this.flag === 't'){
            this.logToTelegram(data);
        }
        else if (this.flag === 'c'){
            this.logToConsole(data);
        }
        else {
            this.logToFile(data);
        }
    }

    setFlag(flag){
        if (flag === 'c' || flag === 'f' || flag === 't'){
            this.flag = flag;
        }
        else {
            throw "Invalid Logger flag";
        }
    }

}
var instance = null;
const getLogger = ()=>{
    if (instance === null){
        instance = new Logger();
    }
    return instance;
}

module.exports = getLogger;