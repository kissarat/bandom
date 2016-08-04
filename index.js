"use strict";

const fs = require('fs');

const MAX_UINT = 256 * 256 * 256 * 256 - 1;
const QUARTAL = Number.MAX_SAFE_INTEGER / (1000 * 1000 * 1000);
const MILLION = 1000 * 1000;
const BILLION = 1000 * 1000 * 1000;

var index = 0;

const defined = {
    bufferSize: 16 * 1024,
    offset: 0,
    _start: (function () {
        var time = process.hrtime();
        time = Date.now() / 1000 - time[0];
        return Math.round(time);
    })(),

    read: function (size) {
        var buffer;
        if (!size) {
            size = this.bufferSize;
        }
        if (Buffer.allocUnsafe) {
            buffer = Buffer.allocUnsafe(size);
        }
        else {
            buffer = new Buffer(size);
        }
        var file = fs.openSync('/dev/random', 'r');
        fs.readSync(file, buffer, 0, size);
        fs.closeSync(file);
        return buffer;
    },

    float: function () {
        return exports.uint32BE(MAX_UINT + 1) / MAX_UINT;
    },

    randint: function (min, max) {
        return min + exports.uint32BE(max + 1);
    },

    choice: function (array) {
        return array[exports.uint32BE(array.length)];
    },

    sample: function (population, k) {
        var array = [];
        for (let i = 0; i < k; i++) {
            array.push(exports.choice(population));
        }
        return array;
    },

    shuffle: function (array) {
        return array.sort(exports.comparator);
    },

    comparator: function () {
        return exports.uint8() % 3 - 1;
    },

    array: function (size, max) {
        var array = [];
        for (let i = 0; i < size; i++) {
            array.push(exports.uint32BE(max));
        }
        return array;
    },

    range: function (size) {
        var array = [];
        for (let i = 0; i < size; i++) {
            array.push(i);
        }
        return exports.shuffle(array);
    },

    init: function (size) {
        if (!this.buffer || this.offset + size + this.buffer.byteLength) {
            this.buffer = this.read(size > this.bufferSize ? size : this.bufferSize);
            this.offset = 0;
        }
    },

    piece: function (encoding, size) {
        this.init(size);
        return this.buffer.slice(this.offset, this.offset += size).toString(encoding);
    },

    hex: function (size) {
        return this.piece('hex', size);
    },

    copy: function (buffer, offset, size) {
        if (!offset) {
            offset = 0;
        }
        if (!size) {
            size = buffer.byteLength;
        }
        this.init(size);
        this.buffer.copy(buffer, offset, this.offset, this.offset += size);
    },

    micro: function (prefix, cut) {
        if ('number' != typeof cut) {
            cut = 6;
        }
        var now = process.hrtime();
        now = (this._start + now[0]) * MILLION + now[1] / 1000;
        now = '0000000000' + Math.round(now).toString(36);
        now = now.slice(-cut);
        if (prefix) {
            now = prefix + now;
        }
        return now;
    },

    nano: function (prefix, cut) {
        if ('number' != typeof cut) {
            cut = 9;
        }
        var now = process.hrtime();
        now = ((this._start + now[0]) % QUARTAL) * BILLION + now[1] / 1000;
        now = '0000000000000' + Math.round(now).toString(36);
        now = now.slice(-cut);
        if (prefix) {
            now = prefix + now;
        }
        return now;
    },

    inc: function (width) {
        if ('number' !== typeof width) {
            width = 3;
        }
        return (new Array(width).join('0') + ++index).toString(36).slice(-width);
    },

    lower: function (size) {
        if ('number' !== typeof size) {
            size = 6;
        }
        return exports.sample('abcdefghijklmnopqrstuvwxyz', size).join('');
    },

    upper: function (size) {
        if ('number' !== typeof size) {
            size = 6;
        }
        return exports.sample('ABCDEFGHIJKLMNOPQRSTUVWXYZ', size).join('');
    },

    letters: function (size) {
        if ('number' !== typeof size) {
            size = 4;
        }
        return exports.sample('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', size).join('');
    },

    lettersDigits: function (size) {
        if ('number' !== typeof size) {
            size = 4;
        }
        return exports.sample('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', size).join('');
    }
};

var bufferMethods = {
    Int8: 1,
    Int16BE: 2,
    Int16LE: 2,
    Int32BE: 4,
    Int32LE: 4,
    UInt8: 1,
    UInt16BE: 2,
    UInt16LE: 2,
    UInt32BE: 4,
    UInt32LE: 4,
    // IntBE: 6,
    // IntLE: 6,
    FloatBE: 4,
    FloatLE: 4,
    DoubleBE: 8,
    DoubleLE: 8
};

for (let method in bufferMethods) {
    (function (method) {
        var fn = (function (method, size) {
            if (!this.buffer) {
                this.buffer = this.read();
            }
            var value;
            try {
                value = this.buffer[method](this.offset);
            }
            catch (ex) {
                if (ex instanceof RangeError) {
                    this.buffer = this.read();
                    this.offset = 0;
                    value = this.buffer[method](this.offset);
                }
            }
            this.offset += size;
            return value;
        }).bind(this, 'read' + method, bufferMethods[method]);
        this[method.slice(0, 2).toLocaleLowerCase() + method.slice(2)] = function (size) {
            return size ? fn.call(this, size) % size : fn.call(this, size);
        }
    }).call(module.exports, method)
}

for (let key in defined) {
    exports[key] = defined[key];
}
