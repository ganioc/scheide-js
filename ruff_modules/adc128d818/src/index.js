'use strict';

var driver = require('ruff-driver');
var async = require('ruff-async');


var CONFIG_REG = 0x00;
var CONFIG_START = 0x01;
var CONFIG_INT_CLEAR = 0x01 << 3;

var INT_STAT_REG = 0x01;
var INT_MASK_REG = 0x03;
var INT_MASK_SETTING = 0xFF;
var CONV_RATE_REG = 0x07;
// Conversion rate
var CONTINU_MODE = 0x01;
var LOWPOWER_MODE = 0x00;


var CHAN_DIS_REG = 0x08;
var ONE_SHOT_REG = 0x09;
var DELAY_ONE_SHOT = 1000;
var CHAN_DIS_SETTING = 0x60;
var DEEP_SHUTDOWN_REG = 0x0A;

var ADV_CONFIG_REG = 0x0B; // select external reference
var EXTERNAL_REF_ENA = 0x01;
var INTERNAL_REF_ENA = 0x00;
var OPERATION_MODE0 = 0x00 << 1;  // chan 7 for temp sensor
var OPERATION_MODE1 = 0x01 << 1;  // normal 
var OPERATION_MODE2 = 0x02 << 1;  // 4 diff input + hot temp 
var OPERATION_MODE3 = 0x03 << 1;  // 4 single, 1 diff + hot temp

var BUSY_STAT_REG = 0x0C;
var LIMIT_REG1 = 0x2A;
var LIMIT_REG2 = 0x30;
var LIMIT_REG3 = 0x31;
var LIMIT_REG4 = 0x32;
var LIMIT_REG5 = 0x33;
var LIMIT_REG6 = 0x34;
var LIMIT_REG7 = 0x35;
var LIMIT_REG8 = 0x36;
var LIMIT_REG9 = 0x37;
var LIMIT_REG10 = 0x38;
var LIMIT_REG11 = 0x39;
var MANUFAC_ID_REG = 0x3E;
var REV_ID_REG = 0x3F;

var bIntRef = true;  // use internal ADC reference

function enADCRef() {
    if (bIntRef === true) {
        return INTERNAL_REF_ENA;
    } else {
        return EXTERNAL_REF_ENA;
    }
}
function setADCRef(bInternal) {
    bIntRef = bInternal;
}
function getADCRef() {
    return bIntRef;
}

function calcVal(val) {
    var num = 0.0;
    if (getADCRef() === true) {
        num = (val / 4096) * 2.56;
    } else {
        num = (val / 4096) * 3.3;
    }
    return Number(num.toFixed(3));
}


module.exports = driver({

    attach: function (inputs, context) {
        // this._<interface> = inputs['<interface>'];
        this._i2c = inputs['i2c'];

        bIntRef = true;

        async.series([
            this._i2c.writeByte.bind(this._i2c, ADV_CONFIG_REG, enADCRef() | OPERATION_MODE0),
            this._i2c.writeByte.bind(this._i2c, CONV_RATE_REG, CONTINU_MODE),
            this._i2c.writeByte.bind(this._i2c, CHAN_DIS_REG, CHAN_DIS_SETTING),
            this._i2c.writeByte.bind(this._i2c, INT_MASK_REG, INT_MASK_SETTING),
            this._i2c.writeByte.bind(this._i2c, CONFIG_REG, 0x00),
            this._i2c.writeByte.bind(this._i2c, DEEP_SHUTDOWN_REG, 0x01)
        ], function (error, values) {
            if (error) {
                return;
            }
        });
    },

    exports: {
        readVer: function (callback) {
            this._i2c.readByte(REV_ID_REG, function (error, value) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined, value & 0xFF);
            });
        },
        readManuId: function (callback) {
            this._i2c.readByte(MANUFAC_ID_REG, function (error, value) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined, value & 0xFF);
            });
        },
        readChan: function (channel, callback) {
            var that = this;
            this._i2c.readWord(channel, function (error, value) {
                if (error) {
                    callback(error);
                    return;
                }
                var mVal = (value & 0xFF) << 4 | (value & 0xFF00 >> 12)
                callback(undefined, (channel == that.chan3 || channel == that.chan4) ? calcVal(mVal) : calcVal(mVal) * 2.0);
            })
        },
        readChanOneShot: function (channel, callback) {
            var that = this;

            async.series([
                this._i2c.writeByte.bind(this._i2c, CONV_RATE_REG, LOWPOWER_MODE),
                this._i2c.writeByte.bind(this._i2c, ONE_SHOT_REG, 0x01),
                function (callback) {
                    setTimeout(function () {
                        callback();
                    }, DELAY_ONE_SHOT);
                }

            ], function (error, values) {
                if (error) {
                    callback(error);
                    return;
                }
                // read from 
                that._i2c.readWord(channel, function (error, value) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    var mVal = (value & 0xFF) << 4 | (value & 0xFF00) >> 12
                    callback(undefined, (channel == that.chan3 || channel == that.chan4) ? calcVal(mVal) : calcVal(mVal) * 2.0);
                })
            });
        },
        readTemp: function (callback) {
            this._i2c.readWord(this.chantemp, function (error, value) {
                if (error) {
                    callback(error);
                    return;
                }
                // console.log("Temp Value: ", value)
                var mVal = (value & 0xFF) << 1 | (value & 0x8000) >> 15

                var mTrans = (mVal > 256) ? (-(512 - mVal) / 2.0).toFixed(1) : (mVal / 2.0).toFixed(1);
                callback(undefined, Number(mTrans));
            })
        },
        stop: function (callback) {
            // config
            async.series([
                this._i2c.writeByte.bind(this._i2c, CONFIG_REG, 0x00),
                this._i2c.writeByte.bind(this._i2c, DEEP_SHUTDOWN_REG, 0x01)
            ], function (error, values) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined);
            });
        },
        start: function (callback) {
            // config 
            async.series([
                this._i2c.writeByte.bind(this._i2c, CONV_RATE_REG, CONTINU_MODE),
                this._i2c.writeByte.bind(this._i2c, CONFIG_REG, 0x01)
            ], function (error, values) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined);
            });
        },
        /**
         * 
         * @param {*} bInternal true, use internal 2.56V; false use exteranl 3.3V
         * @param {*} callback 
         */

        setIntRef: function (callback) {
            setADCRef(true);
            this._i2c.writeByte(ADV_CONFIG_REG, enADCRef() | OPERATION_MODE0, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined);
            })
        },
        setExtRef: function (callback) {
            setADCRef(false);
            this._i2c.writeByte(ADV_CONFIG_REG, enADCRef() | OPERATION_MODE0, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(undefined);
            })
        },
        chan0: 0x20,  // reg address
        chan1: 0x21,
        chan2: 0x22,
        chan3: 0x23,
        chan4: 0x24,
        chantemp: 0x27
    }

});
