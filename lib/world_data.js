class WorldData {
  #skyboxes;
  #blockData;
  #blockDataRuntime;
  #blockNameToRuntimeID;
  #blockRuntimeIDToName;
  #chunkDefaultBlock;
  #chunkInvalidIDPlaceholderBlock;
  #dimensions;
  #chunkSize;
  #chunkSizeBigintRuntime;
  #chunkStore;
  
  static getDefaults() {
    return {
      skyboxes: new Map([
        ['inf_voxel_test:standard', {
          front: 'textures/skybox_side.png',
          back: 'textures/skybox_side.png',
          left: 'textures/skybox_side.png',
          right: 'textures/skybox_side.png',
          top: 'textures/skybox_top.png',
          bottom: 'textures/skybox_bottom.png',
        }],
      ]),
      blockData: new Map([
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
    }
  }
  
  generateRuntimeVars() {
    this.#blockDataRuntime = null; // todo
    this.#blockNameToRuntimeID = null; // todo
    this.#blockRuntimeIDToName = null; // todo
    this.#chunkSizeBigintRuntime = BigInt(this.#chunkSize);
    this.#chunkStore = null; // todo
  }
}
