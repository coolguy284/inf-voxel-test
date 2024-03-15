class GameSettings {
  #settings;
  #settingsRuntime;
  
  constructor() {
    this.resetToDefault();
  }
  
  resetToDefault() {
    this.#settings = {
      // visual
      chunkRenderRadius: 5,
      chunkRenderingOrder: CHUNK_RENDERING_ORDER.CLOSEST_FIRST,
      maxChunkLoadsPerFrame: 1000,
      maxChunkLoadMillisPerFrame: 3,
      screenSpaceAmbientOcclusion: true,
      camMinDist: 0.01,
      camFovDeg: 90,
      maxChatMsgs: 10,
      
      // visual > data menus
      fpsAvgFrames: 240, // number of frames to average to get average fps from
      fixedRenderPrec: 3,
      floatNumberPrec: 3,
      /*
        0 - 4 cardinal directions
        1 - 8 directions
        2 - 16 directions
        3 - 32 directions
      */
      compassRotationPrecision: 0,
      
      // gameplay
      movementSpeed: 10,
      blockRaycastStepSize: 0.1,
      blockRaycastMaxDist: 100,
    };
    
    this.generateRuntimeSettings();
  }
  
  generateRuntimeSettings() {
    this.#settingsRuntime = {
      chunkRenderRadiusBigint: BigInt(this.#settings.chunkRenderRadius),
    };
  }
}
