let MOVEMENT_SPEED = 10;
let CHUNK_RENDER_RADIUS = 3;
// 0 - flat
// 1 - earth
let WORLDGEN_MODE = 0;
let FIXED_NUMBER_PREC = 3;
let FLOAT_NUMBER_PREC = 3;
let FPS_AVG_FRAMES = 120 * 2;

let CHUNK_SIZE = 6;
let MAX_REGEN_QUEUE_PER_FRAME = 1000;
let MAX_REGEN_MILLIS_PER_FRAME = 3;
// 0 - bottom up
// 1 - closest first
let CHUNK_REGEN_ORDER = 1;

let CHUNK_RENDER_RADIUS_BIGINT = BigInt(CHUNK_RENDER_RADIUS);
let CHUNK_SIZE_BIGINT = BigInt(CHUNK_SIZE);

// 0 - 4 cardinal directions
// 1 - 8 directions
// 2 - 16 directions
// 3 - 32 directions
let ROTATION_SECTION_PRECISION = 3;
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

let KEY_CODES = {
  ShiftLeft: 16,
  Space: 32,
  KeyA: 65,
  KeyD: 68,
  KeyS: 83,
  KeyW: 87,
  KeyX: 88,
};

let MOUSE_CODES = {
  LEFT: 0,
  RIGHT: 2,
};

let SKYBOX_DATA = {
  front: 'textures/skybox_side.png',
  back: 'textures/skybox_side.png',
  left: 'textures/skybox_side.png',
  right: 'textures/skybox_side.png',
  top: 'textures/skybox_top.png',
  bottom: 'textures/skybox_bottom.png',
};

let BLOCK_DATA = new Map([
  ['inf_voxel_test:air', {
    render: false,
    texture: null,
  }],
  ['inf_voxel_test:stone', {
    render: true,
    texture: 'textures/stone.png',
  }],
  ['inf_voxel_test:grass', {
    render: true,
    texture: 'textures/grass.png',
  }],
  ['inf_voxel_test:dirt', {
    render: true,
    texture: 'textures/dirt.png',
  }],
]);
let BLOCKS;

let DEFAULT_BLOCK = 'inf_voxel_test:air';
let CHUNK_INVALID_ID_BLOCK = 'inf_voxel_test:air';
