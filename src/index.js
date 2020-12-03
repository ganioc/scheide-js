'use strict';

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log("start");

    setInterval(function(){
	console.log("output");
    },2000);
    // $('#led-r').turnOn();
});

$.end(function () {
    // $('#led-r').turnOff();
});
