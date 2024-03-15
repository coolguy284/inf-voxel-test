class WorldData {
  #scene;
  
  #skyboxes;
  #blockData;
  #chunkDefaultBlock;
  #chunkInvalidIDPlaceholderBlock;
  #dimensions;
  #chunkSize;
  #waypoints;
  
  #skyboxesRuntime;
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
        ['inf_voxel_test:main', {
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
  
  constructor(scene) {
    this.#scene = scene;
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
  
  #makeTextureAndMaterial(blockName, renderMode, textureURL, suffix) {
    let texture = new BABYLON.Texture(textureURL, this.#scene);
    let material = new BABYLON.StandardMaterial(`${blockName}::material${suffix}`, this.#scene);
    // https://doc.babylonjs.com/features/featuresDeepDive/materials/advanced/transparent_rendering
    switch (renderMode) {
      case BLOCK_RENDER.NO_ALPHA: material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE; break;
      case BLOCK_RENDER.ALPHA_TEST: material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST; break;
      case BLOCK_RENDER.FULL_ALPHA: material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND; break;
    }
    material.diffuseTexture = texture;
    return [ texture, material ];
  }
  
  disposeRuntimeVars() {
    if (this.#skyboxesRuntime != null) {
      for (let [ _skyboxName, skyboxRuntime ] of this.#skyboxesRuntime.entries()) {
        skyboxRuntime.dispose();
      }
      
      this.#skyboxesRuntime.clear();
    }
    
    if (this.#blockDataRuntime != null) {
      for (let [ _blockName, blockDataRuntime ] of this.#blockDataRuntime.entries()) {
        if (blockDataRuntime.material) {
          blockDataRuntime.material.dispose(null, true);
        } else {
          blockDataRuntime.materialPosX.dispose(null, true);
          blockDataRuntime.materialPosY.dispose(null, true);
          blockDataRuntime.materialPosZ.dispose(null, true);
          blockDataRuntime.materialNegX.dispose(null, true);
          blockDataRuntime.materialNegY.dispose(null, true);
          blockDataRuntime.materialNegZ.dispose(null, true);
        }
      }
    
      this.#blockDataRuntime.clear();
    }
  }
  
  generateRuntimeVars() {
    this.disposeRuntimeVars();
    
    this.#skyboxesRuntime = new Map(Array.from(this.#skyboxes.entries()).map(([ skyboxName, skyboxData ]) => {
      let texArray = texArrayFromBlockData(skyboxData);
      return [
        skyboxName,
        // https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox
        new BABYLON.CubeTexture(texArray[0], scene, null, null, texArray),
      ];
    }));
    
    this.#blockDataRuntime = new Map(Array.from(this.#blockData.entries()).map(([ blockName, blockData ]) => {
      let blockDataRuntime = {};
      if (blockData.renderMode != BLOCK_RENDER.NONE) {
        if (blockData.texture != null) {
          // single texture for all faces
          [ blockDataRuntime.texture, blockDataRuntime.material ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.texture, '');
        } else {
          // textures per face
          [ blockDataRuntime.texturePosX, blockDataRuntime.materialPosX ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.texturePosX, 'PosX');
          [ blockDataRuntime.texturePosY, blockDataRuntime.materialPosY ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.texturePosY, 'PosY');
          [ blockDataRuntime.texturePosZ, blockDataRuntime.materialPosZ ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.texturePosZ, 'PosZ');
          [ blockDataRuntime.textureNegX, blockDataRuntime.materialNegX ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.textureNegX, 'NegX');
          [ blockDataRuntime.textureNegY, blockDataRuntime.materialNegY ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.textureNegY, 'NegY');
          [ blockDataRuntime.textureNegZ, blockDataRuntime.materialNegZ ] = this.#makeTextureAndMaterial(blockName, blockData.renderMode, blockData.textureNegZ, 'NegZ');
        }
      }
      if (Object.keys(blockDataRuntime).length > 0) {
        return [blockName, blockDataRuntime];
      } else {
        return null;
      }
    }).filter(x => x != null));
    
    let blockNames = Array.from(this.#blockData.keys());
    
    this.#blockNameToRuntimeID = new Map(blockNames.map((x, i) => [x, i]));
    this.#blockRuntimeIDToName = new Map(blockNames.map((x, i) => [i, x]));
    this.#chunkSizeBigintRuntime = BigInt(this.#chunkSize);
    this.#chunkStore = new ChunkManager(this.#chunkDefaultBlock);
  }
  
  get blockData() {
    return this.#blockData;
  }
  
  get dimensions() {
    return this.#dimensions;
  }
  
  get chunkSize() {
    return this.#chunkSize;
  }
  
  get blockDataRuntime() {
    return this.#blockDataRuntime;
  }
  
  get blockNameToRuntimeID() {
    return this.#blockNameToRuntimeID;
  }
  
  get blockRuntimeIDToName() {
    return this.#blockRuntimeIDToName;
  }
  
  get chunkSizeBigintRuntime() {
    return this.#chunkSizeBigintRuntime;
  }
  
  getSkyboxData(dimension) {
    return this.#skyboxes.get(this.#dimensions.get(dimension).skybox);
  }
  
  getSkyboxTexture(dimension) {
    return this.#skyboxesRuntime.get(this.#dimensions.get(dimension).skybox);
  }
  
  getWorldGenMode(dimension) {
    return this.dimensions.get(dimension).worldGenMode;
  }
  
  getEmptyBlock(dimension) {
    return this.#dimensions.get(dimension).raycastOrBreakEmptyBlock;
  }
  
  get chunkStore() {
    return this.#chunkStore;
  }
}
