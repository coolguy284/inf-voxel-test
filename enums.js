// gameplay

let BLOCK_RENDER = {
  NONE: 0,
  NO_ALPHA: 1,
  ALPHA_TEST: 2,
  FULL_ALPHA: 3,
};

let WORLDGEN = {
  FLAT: 0,
  EARTH: 1,
  BAD_SINEWAVES: 2, // deliberately badly coded sinewaves
};

let MULTIPLAYER_STATE = {
  SINGLEPLAYER: 0,
  MULTIPLAYER_HOST: 1,
  MULTIPLAYER_GUEST: 2,
};

// visual

let CHUNK_RENDERING_ORDER = {
  BOTTOM_UP: 0,
  CLOSEST_FIRST: 1,
};

let CHUNK_BACKING = {
  WORLDGEN: 0,
  MULTIPLAYER: 1,
};

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
