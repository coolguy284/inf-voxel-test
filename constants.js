let MOVEMENT_SPEED = 3;
let RENDER_RADIUS = 2;

let CHUNK_SIZE = 16;

let KEY_CODES = {
  ShiftLeft: 16,
  Space: 32,
  KeyA: 65,
  KeyD: 68,
  KeyS: 83,
  KeyW: 87,
  KeyX: 88,
};

let BLOCK_DATA = new Map([
  ['inf_voxel_test:air', {}],
  ['inf_voxel_test:stone', {}],
]);

let DEFAULT_BLOCK = 'inf_voxel_test:air';
let CHUNK_INVALID_ID_BLOCK = 'inf_voxel_test:air';
