'use strict';
// $('#led-r').turnOn(); pin 22 , 4G data activity
// $('#led-r').turnOff(); pin 24, USB Serial data activity

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
function runApp() {
    setInterval(function () {
        console.log("output");
        $('#led-r').turnOn();
        $('#led-b').turnOn();
    }, 2000);
}
$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log("start");

    var uartPort = createUartInstance('/dev/ttyUSB0', uartOptions);

    if (uartPort === undefined) {
        console.error("Can not open port")
    } else {
        console.log("USB port opened OK");
        runApp();
    }


});

$.end(function () {

});
