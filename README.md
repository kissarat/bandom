### Bandom
## Config
* buffer (Buffer)

Current buffer. The current buffer loads every time when used
* bufferSize (integer)

Default buffer size (default 16k)
* offset (integer)

Offset in current buffer. Always less than bufferSize
## Random version of Buffer methods
See [Buffer](https://nodejs.org/api/buffer.html)
* int8(max)
* int16BE(max)
* int16LE(max)
* int32BE(max)
* int32LE(max)
* uint8(max)
* uint16BE(max)
* uint16LE(max)
* uint32BE(max)
* uint32LE(max)
* floatBE(max)
* floatLE(max)
* doubleBE(max)
* doubleLE(max)

All methods return value less than max.
If parameter max is undefined then maximum possible is used.
## Advance methods
* array(size, max)

Return array with `size` length and integer values less then `max`
* choice(array)

Return a random element from the non-empty sequence `array`.
* comparator

Return 1, 0 or -1
* float

Like Math.random
* randint(a, b)

Return a random integer N such that a <= N <= b.
* range(size)

Return set with `size` length in [0, size)
* sample(population, k)

Return a `k` length list of unique elements chosen from the `population` array or set.
Used for random sampling without replacement.
* shuffle(array)

Shuffle the sequence `array` in place

