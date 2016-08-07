"use strict";

const bandom = require('../..');
const assert = require('assert');
const _ = require('underscore');

const MAX_UINT = 256 * 256 * 256 * 256 - 1;
const repeat = 128;

function getPrimes(max) {
    const sieve = [];
    const primes = [];
    for (let i = 2; i <= max; ++i) {
        if (!sieve[i]) {
            primes.push(i);
            for (let j = i << 1; j <= max; j += i) {
                sieve[j] = true;
            }
        }
    }
    return primes;
}

const primes = getPrimes(16384);
const sampleSizes = primes.slice(2, 16);
const bufferSizes = primes.slice(17);

describe('advanced', function () {
    it('float', function (done) {
        const float = bandom.float();
        assert(float === bandom.buffer.readUInt32BE() / MAX_UINT);
        done();
    });

    it('uint8', function (done) {
        for (let i = 0; i < repeat; i++) {
            let value = bandom.uint8();
            assert(value >= 0);
            assert(value < 256);
        }
        done();
    });

    it('uint16', function (done) {
        for (let i = 0; i < repeat; i++) {
            let value = bandom.uint16BE();
            assert(value >= 0);
            assert(value < 256 * 256);
        }
        done();
    });

    it('uint32', function (done) {
        for (let i = 0; i < repeat; i++) {
            let value = bandom.uint32BE();
            assert(value >= 0);
            assert(value < 256 * 256 * 256 * 256);
        }
        done();
    });

    it('uint8 max', function (done) {
        for (let i = 0; i < repeat; i++) {
            let max = 2 + bandom.uint8();
            let value = bandom.uint8(max);
            assert(value < max, `${value} < ${max}`);
        }
        done();
    });

    it('uint16 max', function (done) {
        for (let i = 0; i < repeat; i++) {
            let max = 2 + bandom.uint16BE();
            let value = bandom.uint16BE(max);
            assert(value < max, `${value} < ${max}`)
        }
        done();
    });

    it('uint32 max', function (done) {
        for (let i = 0; i < repeat; i++) {
            let max = 2 + bandom.uint32BE();
            let value = bandom.uint32BE(max);
            assert(value < max, `${value} < ${max}`)
        }
        done();
    });

    it('randint', function (done) {
        const min = _.random(0, 100);
        const max = _.random(101, 1000);
        for (let i = 0; i < repeat; i++) {
            let value = bandom.randint(min, max);
            assert(value >= min, `${value} >= ${min}`);
            assert(value <= max, `${value} <= ${max}`);
        }
        done();
    });


    it('array', function (done) {
        bandom.init(bandom.choice(bufferSizes), true);
        for (let i = 0; i < repeat; i++) {
            let max = bandom.choice(bufferSizes);
            let size = bandom.choice(sampleSizes);
            let array = bandom.array(size, max);
            assert(array.length === size, 'Invalid array size');
            let outOfRange = _.find(array, a => a >= max);
            assert(!outOfRange, 'Element out of range ' + outOfRange);
        }
        done();
    });

    it('shuffle', function (done) {
        bandom.init(bandom.choice(bufferSizes), true);
        for (let i = 0; i < repeat; i++) {
            const array = bandom.array(bandom.choice(sampleSizes));
            const sample = bandom.shuffle(array);
            assert(array.length === sample.length, 'Sizes not equivalent');
            assert(sample.every(a => array.indexOf(a) >= 0), 'Element not found');
        }
        done();
    });

    it('sample', function (done) {
        bandom.init(bandom.choice(bufferSizes), true);
        const array = bandom.array(50);
        for (let i = 0; i < repeat; i++) {
            let k = _.random(1, 20);
            let sample = bandom.sample(array, k);
            assert(sample.length === k);
        }
        done();
    });

    it('range', function (done) {
        bandom.init(bandom.choice(bufferSizes), true);
        for (let i = 0; i < repeat; i++) {
            let k = _.random(1, 20);
            let sample = bandom.range(k);
            assert(sample.every(a => a >= 0 && a < k));
        }
        done();
    });

    it('comparator', function (done) {
        for (let i = 0; i < repeat; i++) {
            let v = bandom.comparator();
            assert(-1 === v || 0 === v || 1 === v);
        }
        done();
    });
});
