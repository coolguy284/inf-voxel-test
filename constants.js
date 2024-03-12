let MOVEMENT_SPEED = 3;
let RENDER_RADIUS = 2;

let CHUNK_SIZE = 16;
let CHUNK_SIZE_BIGINT = BigInt(CHUNK_SIZE);

let KEY_CODES = {
  ShiftLeft: 16,
  Space: 32,
  KeyA: 65,
  KeyD: 68,
  KeyS: 83,
  KeyW: 87,
  KeyX: 88,
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

let DEFAULT_BLOCK = 'inf_voxel_test:air';
let CHUNK_INVALID_ID_BLOCK = 'inf_voxel_test:air';
