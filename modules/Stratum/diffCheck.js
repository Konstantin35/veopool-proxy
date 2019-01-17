const shajs = require('sha.js');

function hashToInteger(hashBytes){
    var x = new Uint32Array(1);
    var z = new Uint32Array(1);
    var y = new Uint32Array(2);
    
    for (let i =0; i<31; i++){
        if (hashBytes[i] === 0){
            x[0]+=8;
            continue;
        }
        else if (hashBytes[i] < 2){
            x[0] +=7;
            z[0] = hashBytes[i+1];
        }
        else if (hashBytes[i]<4){
            x[0] += 6;
            z[0] = (hashBytes[i+1] / 2) + ((hashBytes[i]%2)*128);
        }
        else if (hashBytes[i]<8){
            x[0] += 5;
            z[0] = (hashBytes[i+1] / 4) + ((hashBytes[i] % 4) * 64);
        }
        else if (hashBytes[i]<16){
            x[0] += 4;
            z[0] = (hashBytes[i+1] / 8) + ((hashBytes[i] % 8)*32);
        }
        else if (hashBytes[i]<32){
            x[0] += 3;
            z[0] = (hashBytes[i+1] / 16) + ((hashBytes[i]%16)*16);
        }
        else if (hashBytes[i]<64){
            x[0] += 2;
            z[0] = (hashBytes[i+1] / 32) + ((hashBytes[i]%32)*8);
        }
        else if (hashBytes[i]<128){
            x[0] += 1;
            z[0] = (hashBytes[i+1] / 64) + ((hashBytes[i] % 64)*4);
        }
        else {
            z[0] = (hashBytes[i+1] / 128) + ((hashBytes[i] % 128)*2)
        }
        break;
     
    }
    y[0] = x;
    y[1] = z;

    return pairToSci(y);
}
function pairToSci(pair){
    var result = new Uint32Array(1);
    result[0] = (256 * pair[0])+pair[1];
    return result[0];
}

function validatePoW(nonce, blockHash){
    var nonceB = Buffer.alloc(23);
    nonceB.fill(0);
    nonceB = Buffer.from(nonce, 'base64');
    var blockHashB = Buffer.from(blockHash, 'base64', 32);
    var text = Buffer.alloc(55);
    //text.fill(0);
    for (let i=0;i<32; i++){
        //text = blockHashB[i];
       text.writeUIntBE(blockHashB.readUIntBE(i,1), i, 1);
       
    }
    for (let i=0; i<23; i++){
        //text[i+32] = nonceB[i];
        text.writeUIntBE(nonceB.readUIntBE(i,1),i+32,1);
    }
    var digest = shajs('sha256').update(text).digest();
    //console.log(hash);
    //console.log(hash);
    var difficuilty = hashToInteger(digest);
    return difficuilty;
}

function checkNonce(nonce, hash, blockDiff, jobDiff){
    var diff = validatePoW(nonce, hash);
    if (diff > blockDiff){
        return 2;
    }
    else if (diff > jobDiff){
        return 1;
    }
    return 0;
}
/*
var hash = "LAV0Pjo7A86MOhothmtpOVPeKsVB1sW8F7Y92TB/4q8=";
var nonce = 'iF5j4AAAAAD95sawAAAAAAAxqgAAFXE=';
var jobDiff = 9900;
var blockDiff = 14040;
*/


module.exports = checkNonce;


