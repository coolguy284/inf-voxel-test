// visual

let ROTATION_SECTION_ANGLE_PRECISIONS = [4, 8, 16, 32];
let ROTATION_SECTION_NAMES = [
  // https://en.wikipedia.org/wiki/Points_of_the_compass
  [
    'N; +Z',
    'E; +X',
    'S; -Z',
    'W; -X',
  ],
  [
    'N; +Z', 'NE; +X+Z',
    'E; +X', 'SE; +X-Z',
    'S; -Z', 'SW; -X-Z',
    'W; -X', 'NW; -X+Z',
  ],
  [
    'N; +ZZ', 'NNE; +X+ZZ', 'NE; +XX+ZZ', 'ENE; +XX+Z',
    'E; +XX', 'ESE; +XX-Z', 'SE; +XX-ZZ', 'SSE; +X-ZZ',
    'S; -ZZ', 'SSW; -X-ZZ', 'SW; -XX-ZZ', 'WSW; -XX-Z',
    'W; -XX', 'WNW; -XX+Z', 'NW; -XX+ZZ', 'NNW; -X+ZZ',
  ],
  [
    'N; +ZZZZ', 'NbE; +X+ZZZZ', 'NNE; +XX+ZZZZ', 'NEbN; +XXX+ZZZZ', 'NE; +XXXX+ZZZZ', 'NEbE; +XXXX+ZZZ', 'ENE; +XXXX+ZZ', 'EbN; +XXXX+Z',
    'E; +XXXX', 'EbS; +XXXX-Z', 'ESE; +XXXX-ZZ', 'SEbE; +XXXX-ZZZ', 'SE; +XXXX-ZZZZ', 'SEbS; +XXX-ZZZZ', 'SSE; +XX-ZZZZ', 'SbE; +X-ZZZZ',
    'S; -ZZZZ', 'SbW; -X-ZZZZ', 'SSW; -XX-ZZZZ', 'SWbS; -XXX-ZZZZ', 'SW; -XXXX-ZZZZ', 'SWbW; -XXXX-ZZZ', 'WSW; -XXXX-ZZ', 'WbS; -XXXX-Z',
    'W; -XXXX', 'WbN; -XXXX+Z', 'WNW; -XXXX+ZZ', 'NWbW; -XXXX+ZZZ', 'NW; -XXXX+ZZZZ', 'NWbN; -XXX+ZZZZ', 'NNW; -XX+ZZZZ', 'NbW; -X+ZZZZ',
  ],
];
