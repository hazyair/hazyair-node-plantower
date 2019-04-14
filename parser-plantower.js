'use strict';

const Transform = require('stream').Transform;
const debugTrans = require('debug')('PT_PROTO.TRANS');

const HEAD1  = 0x42;
const HEAD2 = 0x4d;

class PlantowerParser extends Transform {

    constructor(options = {}) {

        super(options);
        this.buffer = Buffer.alloc(0);

    }


    checkData(data) {

        let sum = 0;
        for (let i = 0; i < data.length - 2; i++) {
            sum += data[i];
        }
        return sum === data[data.length - 1] + 256 * data[data.length - 2];

    }


    _transform(chunk, encoding, cb) {
        
        debugTrans('RX', chunk);

        this.buffer = Buffer.concat([this.buffer, chunk]);
        let index = -1;
        for (let i = 0; i < this.buffer.length - 3; i++) { // HEAD2 + LEN * 2 = 3
            if (this.buffer[i] === HEAD1 && this.buffer[i + 1] == HEAD2) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            cb();
            return;
        }
        let length = (this.buffer[index + 2] * 256 + this.buffer[index + 3]);
        debugTrans('length: ' + length);
        let end = index + 4 + length;
        if (this.buffer.length < end) {
            cb();
            return;
        }
        if (this.checkData(this.buffer.slice(index, end))) {
            // remove header + size, and checksum
            let ret = this.buffer.slice(index + 4, end - 2);
            this.emit('data', ret);
        } else {
            console.warn('check data failed');
        }
        this.buffer = this.buffer.slice(end);
        cb();

    }

    _flush(cb) {

        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();

    }
}

module.exports = PlantowerParser;
