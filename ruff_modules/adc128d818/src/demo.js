'use strict';

var async = require('ruff-async');

function genChan(ad, func, chan, strChan) {
    return function (callback) {
        func.bind(ad)(chan, function (err, value) {
            if (err) {
                console.log(strChan + "read oneshot ", err);
                callback(err);
                return;
            }
            console.log(strChan + ": ", value + " V");
            callback(undefined, value);
        });
    }
}
/**
 * 
 * @param {*} adc One shot test, a bit slow
 */
function demoReadOneShot(adc) {
    async.series([
        genChan(adc, adc.readChanOneShot, adc.chan0, "channel 0"),
        genChan(adc, adc.readChanOneShot, adc.chan1, "channel 1"),
        genChan(adc, adc.readChanOneShot, adc.chan2, "channel 2"),
        genChan(adc, adc.readChanOneShot, adc.chan3, "channel 3"),
        genChan(adc, adc.readChanOneShot, adc.chan4, "channel 4"),
        function (cb) {
            adc.readTemp(function (error, value) {
                if (error) {
                    cb(error);
                    return;
                }
                console.log("Temp: " + value + " degree")
                cb(undefined, value)
            })
        }

    ], function (err, values) {
        if (!err) {
            console.log(values)
        }
    });
}

function genDelay(delay) {
    return function (callback) {
        setTimeout(function () {
            console.log("Delay 80 ms")
            callback(undefined);
        }, delay)
    }
}
/**
 * 
 * @param {*} adc  in continuous mode , high speed
 */
function demoReadContinuous(adc) {
    async.series([
        adc.start.bind(adc),
        genDelay(80),
        genChan(adc, adc.readChan, adc.chan0, "channel 0"),
        genChan(adc, adc.readChan, adc.chan1, "channel 1"),
        genChan(adc, adc.readChan, adc.chan2, "channel 2"),
        genChan(adc, adc.readChan, adc.chan3, "channel 3"),
        genChan(adc, adc.readChan, adc.chan4, "channel 4"),
        function (cb) {
            adc.readTemp(function (error, value) {
                if (error) {
                    cb(error);
                    return;
                }
                console.log("Temp: " + value + " degree")
                cb(undefined, value)
            })
        },
        adc.stop.bind(adc)
    ], function (err, values) {
        if (!err) {
            console.log(values)
        }
    });
}

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    var adc = $("#adc128d818");
    // external ADC ref, 3.3V
    // adc.setExtRef(function (err) {
    //     if (err) {
    //         console.log("set adc ref failed");
    //     }
    // });
    // Internal ADC Ref source
    adc.setIntRef(function (err) {
        if (err) {
            console.log("set adc ref failed");
        }
    });

    setInterval(function () {
        // demoReadOneShot(adc);
        demoReadContinuous(adc);
    }, 10000)


});

$.end(function () {
});
