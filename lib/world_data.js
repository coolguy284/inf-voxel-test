class WorldData {
  #skyboxes;
  #blockData;
  #chunkDefaultBlock;
  #chunkInvalidIDPlaceholderBlock;
  #dimensions;
  #chunkSize;
  #waypoints;
  #blockDataRuntime;
  #blockNameToRuntimeID;
  #blockRuntimeIDToName;
  #chunkSizeBigintRuntime;
  #chunkStore;
  #multiplayerState = MULTIPLAYER_STATE.SINGLEPLAYER;
  #multiplayerKey = null;
  #multiplayerName = null;
  
  static getDefaults() {
    return {
      skyboxes: new Map([
        ['inf_voxel_test:standard', {
          posX: 'textures/skybox_side.png',
          posY: 'textures/skybox_top.png',
          posZ: 'textures/skybox_side.png',
          negX: 'textures/skybox_side.png',
          negY: 'textures/skybox_bottom.png',
          negZ: 'textures/skybox_side.png',
        }],
      ]),
      blockData: new Map([
        /*
          main params:
          {
            renderMode,
          }
          render params:
            no rendering:
            {}
            same texture on all sides:
            {
              texture: image path,
            }
            different texture on different sides:
            {
              texturePosX: image path,
              texturePosY: image path,
              texturePosZ: image path,
              textureNegX: image path,
              textureNegY: image path,
              textureNegZ: image path,
            }
        */
        ['inf_voxel_test:air', {
          renderMode: BLOCK_RENDER.NONE,
        }],
        ['inf_voxel_test:stone', {
          renderMode: BLOCK_RENDER.NO_ALPHA,
          texture: 'textures/stone.png',
        }],
        ['inf_voxel_test:dirt', {
          renderMode: BLOCK_RENDER.NO_ALPHA,
          texture: 'textures/dirt.png',
        }],
        ['inf_voxel_test:grass', {
          renderMode: BLOCK_RENDER.NO_ALPHA,
          texture: 'textures/grass.png',
        }],
        ['inf_voxel_test:sand', {
          renderMode: BLOCK_RENDER.NO_ALPHA,
          texture: 'textures/sand.png',
        }],
        ['inf_voxel_test:water', {
          renderMode: BLOCK_RENDER.FULL_ALPHA,
          texture: 'textures/water.png',
        }],
      ]),
      chunkDefaultBlock: 'inf_voxel_test:air',
      chunkInvalidIDPlaceholderBlock: 'inf_voxel_test:air',
      dimensions: new Map([
        ['inf_voxel_test', {
          skybox: 'inf_voxel_test:standard',
          worldGenMode: WORLDGEN.FLAT,
          worldGenParams: {},
          // what block counts as empty when raycasting, and what block gets filled in when breaking a block
          raycastOrBreakEmptyBlock: 'inf_voxel_test:air',
        }],
      ]),
      chunkSize: 8,
      waypoints: [],
    };
  }
  
  constructor() {
    this.setFromDefault();
  }
  
  setFromDefault() {
    this.setFromObject(WorldData.getDefaults());
  }
  
  setFromObject(obj) {
    this.#skyboxes = obj.skyboxes;
    this.#blockData = obj.blockData;
    this.#chunkDefaultBlock = obj.chunkDefaultBlock;
    this.#chunkInvalidIDPlaceholderBlock = obj.chunkInvalidIDPlaceholderBlock;
    this.#dimensions = obj.dimensions;
    this.#chunkSize = obj.chunkSize;
    this.#waypoints = obj.waypoints;
    this.generateRuntimeVars();
  }
  
  toObject() {
    return {
      skyboxes: this.#skyboxes,
      blockData: this.#blockData,
      chunkDefaultBlock: this.#chunkDefaultBlock,
      chunkInvalidIDPlaceholderBlock: this.#chunkInvalidIDPlaceholderBlock,
      dimensions: this.#dimensions,
      chunkSize: this.#chunkSize,
      waypoints: this.#waypoints,
    };
  }
  
  generateRuntimeVars() {
    this.#blockDataRuntime = null; // todo
    this.#blockNameToRuntimeID = null; // todo
    this.#blockRuntimeIDToName = null; // todo
    this.#chunkSizeBigintRuntime = BigInt(this.#chunkSize);
    this.#chunkStore = null; // todo
  }
}
