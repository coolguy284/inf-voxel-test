class Chunk {
  #idToName = new Map([[0, DEFAULT_BLOCK]]); // Map<id, name>
  #nameToID = new Map([[DEFAULT_BLOCK, 0]]); // Map<id, name>
  #data = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE); // Uint16Array[4096], each one maps to a name in namemapping
  #meshes = []; // managed by chunkrenderer
  #freshlyGenerated = false;
  
  #validateChunkCoords(bx, by, bz) {
    if (!Number.isSafeInteger(bx)) {
      throw new Error(`bx not safe int`);
    }
    
    if (!Number.isSafeInteger(by)) {
      throw new Error(`by not safe int`);
    }
    
    if (!Number.isSafeInteger(bz)) {
      throw new Error(`bz not safe int`);
    }
    
    if (bx < 0 && bx >= CHUNK_SIZE) {
      throw new Error(`bx ${bx} out of bounds`);
    }
    
    if (by < 0 && by >= CHUNK_SIZE) {
      throw new Error(`by ${by} out of bounds`);
    }
    
    if (bz < 0 && bz >= CHUNK_SIZE) {
      throw new Error(`bz ${bz} out of bounds`);
    }
  }
  
  // bx, by, bz int; returns string
  getBlockAt(bx, by, bz) {
    this.#validateChunkCoords(bx, by, bz);
    
    let index = by * (CHUNK_SIZE * CHUNK_SIZE) + bz * CHUNK_SIZE + bx;
    
    let blockID = this.#data[index];
    
    let blockName = this.#idToName.get(blockID);
    
    if (blockName != null) {
      return blockName;
    } else {
      return CHUNK_INVALID_ID_BLOCK;
    }
  }
  
  // bx, by, bz int, blockName is string
  setBlockAt(bx, by, bz, blockName) {
    this.#validateChunkCoords(bx, by, bz);
    
    if (typeof blockName != 'string') {
      throw new Error('blockName invalid');
    }
    
    if (!BLOCK_DATA.has(blockName)) {
      throw new Error(`block ${blockName} is unknown`);
    }
    
    let index = by * (CHUNK_SIZE * CHUNK_SIZE) + bz * CHUNK_SIZE + bx;
    
    let blockID = this.#nameToID.get(blockName);
    
    if (blockID == null) {
      blockID = this.#idToName.size;
      this.#idToName.set(blockID, blockName);
      this.#nameToID.set(blockName, blockID);
    }
    
    this.#data[index] = blockID;
    
    if (this.#freshlyGenerated) {
      this.#freshlyGenerated = false;
    }
  }
  
  getMeshes() {
    return this.#meshes;
  }
  
  getFreshlyGenerated() {
    return this.#freshlyGenerated;
  }
  
  setFreshlyGenerated(value) {
    this.#freshlyGenerated = value;
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
  
  #rawGetChunkAt(cx, cy, cz) {
    return this.#chunks.get(chunkCoordsToID(cx, cy, cz));
  }
  
  #generateChunk(cx, cy, cz) {
    let chunk = new Chunk();
    generateChunkAt(cx, cy, cz, chunk);
    chunk.setFreshlyGenerated(true);
    return chunk;
  }
  
  getChunkAt(cx, cy, cz) {
    this.#validateCoords(cx, cy, cz);
    
    let currentChunk = this.#rawGetChunkAt(cx, cy, cz);
    
    if (currentChunk == null) {
      let chunk = this.#generateChunk(cx, cy, cz);
      
      this.setChunkAt(cx, cy, cz, chunk);
      
      return chunk;
    } else {
      return currentChunk;
    }
  }
  
  setChunkAt(cx, cy, cz, chunk) {
    this.#validateCoords(cx, cy, cz);
    
    this.#chunks.set(chunkCoordsToID(cx, cy, cz), chunk);
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
  
  getChunkActiveMesh(cx, cy, cz) {
    this.#validateCoords(cx, cy, cz);
    
    return this.#chunksWithActiveMesh.has(chunkCoordsToID(cx, cy, cz));
  }
  
  setChunkActiveMesh(cx, cy, cz) {
    this.#validateCoords(cx, cy, cz);
    
    return this.#chunksWithActiveMesh.add(chunkCoordsToID(cx, cy, cz));
  }
  
  clearChunkActiveMesh(cx, cy, cz) {
    this.#validateCoords(cx, cy, cz);
    
    return this.#chunksWithActiveMesh.delete(chunkCoordsToID(cx, cy, cz));
  }
  
  getAllChunksActiveMesh() {
    return Array.from(this.#chunksWithActiveMesh).map(x => chunkIDToCoords(x));
  }
  
  getNumChunks() {
    return this.#chunks.size;
  }
  
  getNumRenderedChunks() {
    return this.#chunksWithActiveMesh.size;
  }
  
  // removes untouched, unrendered chunks from the queue
  purgeUnmodifiedChunks() {
    for (let [ chunkID, chunk ] of this.#chunks.entries()) {
      if (chunk.getFreshlyGenerated() && !this.#chunksWithActiveMesh.has(chunkID)) {
        this.#chunks.delete(chunkID);
      }
    }
  }
}
