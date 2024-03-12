class Chunk {
  #idToName = new Map([[0, DEFAULT_BLOCK]]); // Map<id, name>
  #nameToID = new Map([[DEFAULT_BLOCK, 0]]); // Map<id, name>
  #data = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE); // Uint16Array[4096], each one maps to a name in namemapping
  
  #validateChunkCoords(x, y, z) {
    if (!Number.isSafeInteger(x)) {
      throw new Error(`x not safe int`);
    }
    
    if (!Number.isSafeInteger(y)) {
      throw new Error(`y not safe int`);
    }
    
    if (!Number.isSafeInteger(z)) {
      throw new Error(`z not safe int`);
    }
    
    if (x < 0 && x >= CHUNK_SIZE) {
      throw new Error(`x ${x} out of bounds`);
    }
    
    if (y < 0 && y >= CHUNK_SIZE) {
      throw new Error(`y ${y} out of bounds`);
    }
    
    if (z < 0 && z >= CHUNK_SIZE) {
      throw new Error(`z ${z} out of bounds`);
    }
  }
  
  // x, y, z int; returns string
  getBlockAt(x, y, z) {
    this.#validateChunkCoords(x, y, z);
    
    let index = y * (CHUNK_SIZE * CHUNK_SIZE) + z * CHUNK_SIZE + x;
    
    let blockID = this.#data[index];
    
    let blockName = this.#idToName.get(blockID);
    
    if (blockName != null) {
      return blockName;
    } else {
      return CHUNK_INVALID_ID_BLOCK;
    }
  }
  
  // x, y, z int, blockName is string
  setBlockAt(x, y, z, blockName) {
    this.#validateChunkCoords(x, y, z);
    
    if (typeof blockName != 'string') {
      throw new Error('blockName invalid');
    }
    
    if (!BLOCK_DATA.has(blockName)) {
      throw new Error(`block ${blockName} is unknown`);
    }
    
    let index = y * (CHUNK_SIZE * CHUNK_SIZE) + z * CHUNK_SIZE + x;
    
    let blockID = this.#nameToID.get(blockName);
    
    if (blockID == null) {
      blockID = this.#idToName.size;
      this.#idToName.set(blockID, blockName);
      this.#nameToID.set(blockName, blockID);
    }
    
    this.#data[index] = blockID;
  }
}

class ChunkManager {
  #chunks = new Map(); // Map<string("x,y,z"), Chunk>
}
