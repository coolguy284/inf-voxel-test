class Chunk {
  #idToName = new Map([[0, DEFAULT_BLOCK]]); // Map<id, name>
  #nameToID = new Map([[DEFAULT_BLOCK, 0]]); // Map<id, name>
  #data = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE); // Uint16Array[4096], each one maps to a name in namemapping
  #meshes = []; // managed by chunkrenderer
  
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
  
  getMeshes() {
    return this.#meshes;
  }
}

class ChunkManager {
  #chunks = new Map(); // Map<string("x,y,z"), Chunk>
  #chunksWithActiveMesh = new Set();
  
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
  
  #generateChunk(cx, cy, cz) {
    if (WORLDGEN_MODE == 0) {
      let chunk = new Chunk();
      for (let by = 0; by < CHUNK_SIZE; by++) {
        for (let bz = 0; bz < CHUNK_SIZE; bz++) {
          for (let bx = 0; bx < CHUNK_SIZE; bx++) {
            let [ x, y, z ] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
            
            if (y >= 2n) {
              // empty
            } else if (y == 1n) {
              // empty unless at 0, 0
              if (x == 0n && z == 0n) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
              }
            } else if (y == 0n) {
              // stone at 4, 4 corners; 10% dirt, 90% grass otherwise
              if (x % 4n == 0n && z % 4n == 0n) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
              } else {
                if (Math.random() > 0.1) {
                  chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:grass');
                } else {
                  chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:dirt');
                }
              }
            } else if (y >= -6n) {
              // dirt
              chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:dirt');
            } else {
              // stone
              chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
            }
          }
        }
      }
      return chunk;
    } else if (WORLDGEN_MODE == 1) {
      let chunk = new Chunk();
      for (let by = 0; by < CHUNK_SIZE; by++) {
        for (let bz = 0; bz < CHUNK_SIZE; bz++) {
          for (let bx = 0; bx < CHUNK_SIZE; bx++) {
            let [ x, y, z ] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
            let dist = Math.hypot(Number(x), Number(y), Number(z));
            if (dist < 6371000) {
              let rng = Math.random();
              if (rng > 0.2) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:grass');
              } else if (rng > 0.1) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:dirt');
              } else {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
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
  
  getChunkActiveMesh(x, y, z) {
    this.#validateCoords(x, y, z);
    
    let chunkID = x + ',' + y + ',' + z;
    
    return this.#chunksWithActiveMesh.has(chunkID);
  }
  
  setChunkActiveMesh(x, y, z) {
    this.#validateCoords(x, y, z);
    
    let chunkID = x + ',' + y + ',' + z;
    
    return this.#chunksWithActiveMesh.add(chunkID);
  }
  
  clearChunkActiveMesh(x, y, z) {
    this.#validateCoords(x, y, z);
    
    let chunkID = x + ',' + y + ',' + z;
    
    return this.#chunksWithActiveMesh.delete(chunkID);
  }
  
  getAllChunksActiveMesh() {
    return Array.from(this.#chunksWithActiveMesh).map(x => x.split(',').map(y => BigInt(y)));
  }
}
