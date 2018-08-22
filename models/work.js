var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var io = require('socket.io-client');
var test = false;
var list;
var com, port;
var check1 = false;
var check2 = false;
var str = '';
var hex = '';
var checkStr = '';
var result = {};

if (test) {
    getPorts(function(err, ports){
        ports.forEach(function(port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
            connectionPort(port.comName);
        });
    });
}


var portName, port;

module.exports = {
    getPortList,
    getPort,
    sendCommand,
    isOpen,
    connectionPort,
    getResult,
    getCheck
}

function getCheck () {
    return checkStr;
}

function getResult () {
    return result;
}

function getPort () {
    return port;
}

function getPortList (callback) {
    serialport.list(function (err, ports) {
        if (err) {
            return callback(err, null);
        }
        return callback(null , ports);
    });
}


function sendCommand(data) {
    checkStr = '';
    port.write(data, function(err) {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written');
      });
    //port.write('Hi Mom!');
    //port.write(new Buffer('Hi Mom!'));
}

function isOpen () {
    if(port) {
        return port.isOpen;
    } else {
        return false;
    }
    
}

function connectionPort(portName, callback) {
    if( isOpen() == false && portName) {
        port = new serialport(portName, {
            baudRate: 9600,
            parser: serialport.parsers.raw
        });
    } else {
        return;
    }
   
    port.on("open", function () {
        console.log('open');
        port.on('data', function(data) {
            //console.log(data);
            
            var cmd;
            
            for(let i=0; i < data.length; ++i) {
                hex = hex + data[i] + ' ';
                // console.log((data[i]));
                if (data[i] == 13 ) {
                    check1 = true;
                } else if (data[i] == 10 ) {
                    check2 = true;
                } else {
                    str = str +String.fromCharCode(data[i]);
                }
                if(check1==true && check2) {
                    //Reset to degault
                    check1 = false;
                    check2 = false;
                    console.log(str);
                    var tmp;
                    toVerifyCmd(str);
                    checkStr = checkStr + str + ' ';
                    str = '';
                }
            }
            //console.log(hex);
            //socket.emit('serialport_receive',str);
        });
        return callback(port);
    });

    port.on('close', function(){
        console.log('ARDUINO PORT CLOSED');
        port = null;
        // reconnectDevice();
    });
    
    port.on('error', function (err) {
        console.log("ERROR");
        console.error("error", err);
        // reconnectDevice();
    });
    
    port.on('disconnected', function (err) {
        console.log('on.disconnect');
        port = null;
        // reconnectDevice();
    });
}

function toVerifyCmd(cmd) {
    if(cmd.indexOf('+GGMD:') > -1 ) {
        result.mac = str.substring(7, 15);
    } else if(cmd.indexOf('+GPIN:') > -1 ) {
        result.pin = str.substring(6, 10);
    }
}
  