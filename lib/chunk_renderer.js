class ChunkRenderer {
  #playerPos = new WorldPos();
  #chunkStore;
  #regenerationQueue = new Set();
  
  constructor(playerPos, chunkStore) {
    this.#chunkStore = chunkStore;
    this.#playerPos.copyFrom(playerPos);
    this.regenerateMeshes();
  }
  
  getPlayerChunk() {
    let [ cx, cy, cz ] = blockCoordsToChunkCoords(this.#playerPos.getBlockX(), this.#playerPos.getBlockY(), this.#playerPos.getBlockZ());
    return [cx, cy, cz];
  }
  
  regenerateMesh(cx, cy, cz) {
    let blockTruePos = new WorldPos();
    blockTruePos.setFracX(0.5);
    blockTruePos.setFracY(0.5);
    blockTruePos.setFracZ(0.5);
    
    this.clearMesh(cx, cy, cz);
    
    let chunk = this.#chunkStore.getChunkAt(cx, cy, cz);
    let chunkMeshes = chunk.getMeshes();
    
    for (let by = 0; by < CHUNK_SIZE; by++) {
      for (let bz = 0; bz < CHUNK_SIZE; bz++) {
        for (let bx = 0; bx < CHUNK_SIZE; bx++) {
          let blockName = chunk.getBlockAt(bx, by, bz);
          let blockData = BLOCK_DATA.get(blockName);
          let [x, y, z] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
          blockTruePos.setBlockX(x);
          blockTruePos.setBlockY(y);
          blockTruePos.setBlockZ(z);
          if (blockData.render) {
            let cubeMesh = BABYLON.MeshBuilder.CreateBox(`${blockName}::mesh`, { size: 1 });
            cubeMesh.material = blockData.material;
            cubeMesh.renderingGroupId = 1;
            cubeMesh.position = new BABYLON.Vector3(...blockTruePos.subtract(this.#playerPos).toLowPrecCoords());
            chunkMeshes.push(cubeMesh);
          }
        }
      }
    }
    
    // merge meshes
    if (chunkMeshes.length > 0) {
      if (MERGE_MESH_WITH_CSG) {
        // https://doc.babylonjs.com/features/featuresDeepDive/mesh/mergeMeshes#merging-meshes-with-constructive-solid-geometry
        let geom = BABYLON.CSG.FromMesh(chunkMeshes[0]);
        for (let i = 1; i < chunkMeshes.length; i++) {
          let newGeom = BABYLON.CSG.FromMesh(chunkMeshes[i]);
          geom = geom.union(newGeom);
        }
        let bigMesh = geom.toMesh('chunkMesh', null);
        for (let chunkMesh of chunkMeshes) {
          chunkMesh.dispose();
        }
        chunkMeshes[0] = bigMesh;
      } else {
        chunkMeshes[0] = BABYLON.Mesh.MergeMeshes(chunkMeshes, true, false, null, false, true);
      }
      chunkMeshes.length = 1;
    }
    
    this.#chunkStore.setChunkActiveMesh(cx, cy, cz);
  }
  
  clearMesh(cx, cy, cz) {
    let chunk = this.#chunkStore.getChunkAt(cx, cy, cz);
    
    let chunkMeshes = chunk.getMeshes();
    chunkMeshes.forEach(x => x.dispose());
    chunkMeshes.length = 0;
    
    this.#chunkStore.clearChunkActiveMesh(cx, cy, cz);
  }
  
  #appendToRegenQueue(cx, cy, cz) {
    let chunkID = cx + ',' + cy + ',' + cz;
    this.#regenerationQueue.add(chunkID);
  }
  
  #getAllRegenQueue() {
    return Array.from(this.#regenerationQueue).map(x => x.split(',').map(y => BigInt(y)));
  }
  
  #removeFromRegenQueue(cx, cy, cz) {
    let chunkID = cx + ',' + cy + ',' + cz;
    this.#regenerationQueue.delete(chunkID);
  }
  
  #popOneFromRegenQueue() {
    if (this.#regenerationQueue.size > 0) {
      let chunkID = this.#regenerationQueue.values().next().value;
      this.#regenerationQueue.delete(chunkID);
      return chunkID.split(',').map(x => BigInt(x));
    } else {
      return null;
    }
  }
  
  regenerateMeshes() {
    let [ baseCx, baseCy, baseCz ] = this.getPlayerChunk();
    
    for (let deltaCy = -CHUNK_RENDER_RADIUS_BIGINT; deltaCy <= CHUNK_RENDER_RADIUS_BIGINT; deltaCy++) {
      for (let deltaCz = -CHUNK_RENDER_RADIUS_BIGINT; deltaCz <= CHUNK_RENDER_RADIUS_BIGINT; deltaCz++) {
        for (let deltaCx = -CHUNK_RENDER_RADIUS_BIGINT; deltaCx <= CHUNK_RENDER_RADIUS_BIGINT; deltaCx++) {
          let cx = baseCx + deltaCx;
          let cy = baseCy + deltaCy;
          let cz = baseCz + deltaCz;
          
          this.#appendToRegenQueue(cx, cy, cz);
        }
      }
    }
  }
  
  updateMeshPositions(posDelta) {
    let [ baseCx, baseCy, baseCz ] = this.getPlayerChunk();
    
    let blockTruePos = new WorldPos();
    blockTruePos.setFracX(0.5);
    blockTruePos.setFracY(0.5);
    blockTruePos.setFracZ(0.5);
    
    // clear distant meshes
    for (let [ cx, cy, cz ] of this.#chunkStore.getAllChunksActiveMesh()) {
      if (
        (cx < baseCx - CHUNK_RENDER_RADIUS_BIGINT || cx > baseCx + CHUNK_RENDER_RADIUS_BIGINT) ||
        (cy < baseCy - CHUNK_RENDER_RADIUS_BIGINT || cy > baseCy + CHUNK_RENDER_RADIUS_BIGINT) ||
        (cz < baseCz - CHUNK_RENDER_RADIUS_BIGINT || cz > baseCz + CHUNK_RENDER_RADIUS_BIGINT)
      ) {
        this.clearMesh(cx, cy, cz);
      }
    }
    
    for (let [ cx, cy, cz ] of this.#getAllRegenQueue()) {
      if (
        (cx < baseCx - CHUNK_RENDER_RADIUS_BIGINT || cx > baseCx + CHUNK_RENDER_RADIUS_BIGINT) ||
        (cy < baseCy - CHUNK_RENDER_RADIUS_BIGINT || cy > baseCy + CHUNK_RENDER_RADIUS_BIGINT) ||
        (cz < baseCz - CHUNK_RENDER_RADIUS_BIGINT || cz > baseCz + CHUNK_RENDER_RADIUS_BIGINT)
      ) {
        this.#removeFromRegenQueue(cx, cy, cz);
      }
    }
    
    // update current meshes
    for (let deltaCy = -CHUNK_RENDER_RADIUS_BIGINT; deltaCy <= CHUNK_RENDER_RADIUS_BIGINT; deltaCy++) {
      for (let deltaCz = -CHUNK_RENDER_RADIUS_BIGINT; deltaCz <= CHUNK_RENDER_RADIUS_BIGINT; deltaCz++) {
        for (let deltaCx = -CHUNK_RENDER_RADIUS_BIGINT; deltaCx <= CHUNK_RENDER_RADIUS_BIGINT; deltaCx++) {
          let cx = baseCx + deltaCx;
          let cy = baseCy + deltaCy;
          let cz = baseCz + deltaCz;
          
          if (!this.#chunkStore.getChunkActiveMesh(cx, cy, cz)) {
            // chunk meshes need to be generated
            this.#appendToRegenQueue(cx, cy, cz);
          } else {
            // chunk meshes can be translated
            let chunk = this.#chunkStore.getChunkAt(cx, cy, cz);
            
            let chunkMeshes = chunk.getMeshes();
            
            for (let mesh of chunkMeshes) {
              mesh.position.addInPlace(posDelta);
            }
          }
        }
      }
    }
  }
  
  updatePlayerPos(playerPos) {
    let posDelta = this.#playerPos.subtract(playerPos).toLowPrecCoords();
    this.#playerPos.copyFrom(playerPos);
    this.updateMeshPositions(new BABYLON.Vector3(...posDelta));
  }
  
  regenFromRegenQueue() {
    for (let i = 0; i < MAX_REGEN_QUEUE_PER_FRAME; i++) {
      let chunkPos = this.#popOneFromRegenQueue();
      if (chunkPos == null) break;
      let [ cx, cy, cz ] = chunkPos;
      this.regenerateMesh(cx, cy, cz);
    }
  }
}
