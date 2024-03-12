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
  
  #validateCoords(x, y, z) {
    if (typeof x != 'bigint') {
      throw new Error(`x not bigint`);
    }
    
    if (typeof y != 'bigint') {
      throw new Error(`y not bigint`);
    }
    
    if (typeof z != 'bigint') {
      throw new Error(`z not bigint`);
    }
  }
  
  #rawGetChunkAt(x, y, z) {
    let chunkID = x + ',' + y + ',' + z;
    
    return this.#chunks.get(chunkID);
  }
  
  #generateChunk(_cx, cy, _cz) {
    if (cy > 0n) {
      // y > 0 is empty
      return new Chunk();
    } else if (cy < -1n) {
      // y < -1 is pure stone
      let chunk = new Chunk();
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          for (let x = 0; x < CHUNK_SIZE; x++) {
            chunk.setBlockAt(x, y, z, 'inf_voxel_test:stone');
          }
        }
      }
      return chunk;
    } else if (cy == -1n) {
      // y == -1 is (from top): 6 dirt, [chunk_size - 6] stone
      let chunk = new Chunk();
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          for (let x = 0; x < CHUNK_SIZE; x++) {
            if (y >= CHUNK_SIZE - 6) {
              chunk.setBlockAt(x, y, z, 'inf_voxel_test:dirt');
            } else {
              chunk.setBlockAt(x, y, z, 'inf_voxel_test:stone');
            }
          }
        }
      }
      return chunk;
    } else {
      // y == 0 is (from bottom): 1 of 90% grass, 10% dirt, [chunk_size - 1] of air
      let chunk = new Chunk();
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          for (let x = 0; x < CHUNK_SIZE; x++) {
            if (y >= 1) {
              chunk.setBlockAt(x, y, z, 'inf_voxel_test:air');
            } else {
              if (Math.random() > 0.1) {
                chunk.setBlockAt(x, y, z, 'inf_voxel_test:grass');
              } else {
                chunk.setBlockAt(x, y, z, 'inf_voxel_test:dirt');
              }
            }
          }
        }
      }
      return chunk;
    }
  }
  
  getChunkAt(x, y, z) {
    this.#validateCoords(x, y, z);
    
    let currentChunk = this.#rawGetChunkAt(x, y, z);
    
    if (currentChunk == null) {
      let chunk = this.#generateChunk(x, y, z);
      
      this.setChunkAt(x, y, z, chunk);
      
      return chunk;
    } else {
      return currentChunk;
    }
  }
  
  setChunkAt(x, y, z, chunk) {
    this.#validateCoords(x, y, z);
    
    let chunkID = x + ',' + y + ',' + z;
    
    this.#chunks.set(chunkID, chunk);
  }
  
  getBlockAt(x, y, z) {
    this.#validateCoords(x, y, z);
    
    let [ cx, cy, cz, bx, by, bz ] = blockCoordsToChunkCoords(x, y, z);
    
    let chunk = this.getChunkAt(cx, cy, cz);
    let block = chunk.getBlockAt(bx, by, bz);
    
    return block;
  }
  
  setBlockAt(x, y, z, blockName) {
    this.#validateCoords(x, y, z);
    
    let [ cx, cy, cz, bx, by, bz ] = blockCoordsToChunkCoords(x, y, z);
    
    let chunk = this.getChunkAt(cx, cy, cz);
    chunk.setBlockAt(bx, by, bz, blockName);
  }
}
