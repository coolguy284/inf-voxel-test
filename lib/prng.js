// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

// seed generator, input a string and call returned function repeatedly for 32-bit seeds
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
    h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

class sfc32 {
  #a;
  #b;
  #c;
  #d;
  
  constructor(a, b, c, d) {
    this.#a = a;
    this.#b = b;
    this.#c = c;
    this.#d = d;
  }
  
  getUInt32() {
    this.#a >>>= 0; this.#b >>>= 0; this.#c >>>= 0; this.#d >>>= 0;
    var t = (this.#a + this.#b) | 0;
    this.#a = this.#b ^ this.#b >>> 9;
    this.#b = this.#c + (this.#c << 3) | 0;
    this.#c = (this.#c << 21 | this.#c >>> 11);
    this.#d = this.#d + 1 | 0;
    t = t + this.#d | 0;
    this.#c = this.#c + t | 0;
    return t >>> 0;
  }
  
  // returns float normalized to [0, 1)
  getFloat0To1() {
    return this.getUInt32() / 4294967296;
  }
}
