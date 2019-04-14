'use strict';

var assert = require('assert');
var PlantowerParser = require('../parser-plantower.js');

describe('PlantowerParser', function() {

    var parser = new PlantowerParser();
    
    describe('.checkData(new Buffer([valid data]))', function() {
        it('should return true', function() {
            assert.equal(true, parser.checkData(new Buffer([0x42, 0x4d, 0x00, 0x1c, 0x00, 0x09, 0x00, 0x0d, 0x00, 0x0e,
                                                            0x00, 0x09, 0x00, 0x0d, 0x00, 0x0e, 0x06, 0x87, 0x01, 0xf3,
                                                            0x00, 0x4f, 0x00, 0x04, 0x00, 0x02, 0x00, 0x00, 0x93, 0x00,
                                                            0x03, 0x5c])));
        });
    });
    
    describe('.checkData(new Buffer([invalid data]))', function() {
        it('should return false', function() {
            assert.equal(false, parser.checkData(new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                             0xff, 0xff])));
        });
    });

});
