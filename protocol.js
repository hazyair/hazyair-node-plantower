'use strict';

const SerialPort = require('serialport');
const PlantowerParser = require('./parser-plantower');
const bluebird = require('bluebird');
const debugTrans = require('debug')('PT_PROTO.TRANS');
const debug = require('debug')('PT_PROTO');

const HEAD1  = 0x42;
const HEAD2 = 0x4d;

var Protocol = function (dev) {
    this.defer = null;
    this.busy = true;

    this.port = new SerialPort(dev, {
        baudRate: 9600
    });

    this.queue = [];

    let openDefer = bluebird.defer();
    
    this.port.on('open', () => {
        openDefer.resolve();
    });
    
    this.port.on('error', (err) => {
        openDefer.reject(err);
    });
    
    this.openPromise = openDefer.promise;
    
    const parser = this.port.pipe(new PlantowerParser());
    parser.on('data', (data) => {
        debug('Get data', data);
        this.queue.forEach((defer) => {
            defer.resolve(data);
        });
        this.queue = [];
    });
    
    this.port.open(() => {});
};

Protocol.prototype.read = function () {
    var defer = bluebird.defer();

    this.queue.push(defer);

    return defer.promise;
};

Protocol.prototype.write = function (data) {
    let checksum = HEAD1 + HEAD2;
    for (let i = 0; i < data.length; i++) {
        checksum += data[i];
    }

    data = Buffer.concat([new Buffer([
        HEAD1,
        HEAD2,
    ]), data, new Buffer([
        Math.floor(checksum / 256),
        checksum % 256
    ])]);

    var defer = bluebird.defer();

    this.openPromise.then(() => {
        debugTrans('TX', data);

        this.port.write(data, (err) => {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve();
            }
        });
    });

    return defer.promise;
};

module.exports = Protocol;
