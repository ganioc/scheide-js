'use strict';
/****
 * 
 * $('#led-r').turnOn(); pin 22 , 4G data activity
 * $('#led-b').turnOff(); pin 24, USB Serial data activity
 * 
 */
var net = require('net');
var uartPort;

var USB_DEVPATH = "/dev/ttyUSB0"

function usb_data_on(){
    $('#led-b').turnOn();
    setTimeout(function(){
        $('#led-b').turnOff();
    },100);
}

function mobile_data_on(){
    $('#led-r').turnOn();
    setTimeout(function(){
        $('#led-r').turnOff();
    }, 100)
}


// load usb serial port
function createUartInstance(path, options) {
    var DeviceConstructor = require('sys-uart');
    var inputs = {
        device: { 'path': path }
    };
    var device = new DeviceConstructor(inputs);
    return device.getInterface('uart', options);
}
// usb serial setting
var uartOptions = {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none'
};

var DST_IP = "139.219.8.117";
var DST_PORT = 13100;
var client = new net.Socket();
var handleConnected = false;
var bConnected = false;

function connect() {
    client.connect({
        port: DST_PORT,
        host: DST_IP
    })
}
function launchIntervalConnect() {
    bConnected = false;
    if (handleConnected !== false) {
        return;
    }
    handleConnected = setInterval(connect, 10000);
}
function clearIntervalConnect() {
    if (handleConnected === false) {
        return
    }
    clearInterval(handleConnected);
    handleConnected = false;
}

client.on('connect', function () {
    clearIntervalConnect();
    console.log("Connected to server", "TCP", DST_IP, ":", DST_PORT);
    bConnected = true;
});

client.on('data', function (data) {
    console.log("->", data.toString());
    uartPort.write(data);
});

client.on('error', function (error) {
    console.error(error);
});

client.on('close', launchIntervalConnect);

client.on('end', launchIntervalConnect);

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log("start");

    uartPort = createUartInstance(USB_DEVPATH, uartOptions);

    if (uartPort === undefined) {
        console.error("Can not open port !!!")
    } else {
        console.log("USB port opened OK");
        
        connect(); // Connect to TCP server

        uartPort.on('data',function(data){
            usb_data_on();
            console.log("USB:", data)
        })

        var i=0;
        setInterval(function () {
            if (bConnected === false) {
                return;
            }
            mobile_data_on();

            client.write("Num:" + (i++) + ":" + "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee");
    
        }, 5000);
    }
});

$.end(function () {
    $('#led-r').turnOff();
    $('#led-b').turnOff();
});
