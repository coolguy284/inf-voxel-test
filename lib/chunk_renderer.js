class ChunkRenderer {
  #playerPos = new WorldPos();
  #chunkStore;
  #regenerationQueue = new Set();
  
  static #negXPos = new BABYLON.Vector3(-0.5, 0, 0);
  static #posXPos = new BABYLON.Vector3(0.5, 0, 0);
  static #negYPos = new BABYLON.Vector3(0, -0.5, 0);
  static #posYPos = new BABYLON.Vector3(0, 0.5, 0);
  static #negZPos = new BABYLON.Vector3(0, 0, -0.5);
  static #posZPos = new BABYLON.Vector3(0, 0, 0.5);
  static #negXRot = new BABYLON.Vector3(0, Math.PI / 2, 0);
  static #posXRot = new BABYLON.Vector3(0, -Math.PI / 2, 0);
  static #negYRot = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
  static #posYRot = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  static #negZRot = new BABYLON.Vector3(0, 0, 0);
  static #posZRot = new BABYLON.Vector3(0, Math.PI, 0);
  
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
          if (blockData.render) {
            let [x, y, z] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
            let negXEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x - 1n, y, z)).render;
            let posXEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x + 1n, y, z)).render;
            let negYEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x, y - 1n, z)).render;
            let posYEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x, y + 1n, z)).render;
            let negZEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x, y, z - 1n)).render;
            let posZEmpty = !BLOCK_DATA.get(this.#chunkStore.getBlockAt(x, y, z + 1n)).render;
            let cubeVisible = negXEmpty || posXEmpty || negYEmpty || posYEmpty || negZEmpty || posZEmpty;
            if (cubeVisible) {
              blockTruePos.setBlockX(x);
              blockTruePos.setBlockY(y);
              blockTruePos.setBlockZ(z);
              let cubeCenter = new BABYLON.Vector3(...blockTruePos.subtract(this.#playerPos).toLowPrecCoords());
              if (negXEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negXPos);
                faceMesh.rotation = ChunkRenderer.#negXRot;
                chunkMeshes.push(faceMesh);
              }
              if (posXEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#posXPos);
                faceMesh.rotation = ChunkRenderer.#posXRot;
                chunkMeshes.push(faceMesh);
              }
              if (negYEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negYPos);
                faceMesh.rotation = ChunkRenderer.#negYRot;
                chunkMeshes.push(faceMesh);
              }
              if (posYEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#posYPos);
                faceMesh.rotation = ChunkRenderer.#posYRot;
                chunkMeshes.push(faceMesh);
              }
              if (negZEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negZPos);
                faceMesh.rotation = ChunkRenderer.#negZRot;
                chunkMeshes.push(faceMesh);
              }
              if (posZEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockData.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#posZPos);
                faceMesh.rotation = ChunkRenderer.#posZRot;
                chunkMeshes.push(faceMesh);
              }
            }
          }
        }
      }
    }
    
    // merge meshes
    if (chunkMeshes.length > 0) {
      let merged = BABYLON.Mesh.MergeMeshes(chunkMeshes, true, false, null, false, true);
      chunkMeshes[0] = merged;
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
    this.#regenerationQueue.add(chunkCoordsToID(cx, cy, cz));
  }
  
  #getAllRegenQueue() {
    return Array.from(this.#regenerationQueue).map(x => chunkIDToCoords(x));
  }
  
  #removeFromRegenQueue(cx, cy, cz) {
    this.#regenerationQueue.delete(chunkCoordsToID(cx, cy, cz));
  }
  
  #popOneFromRegenQueue() {
    if (this.#regenerationQueue.size > 0) {
      if (CHUNK_REGEN_ORDER == 0) {
        let chunkID = this.#regenerationQueue.values().next().value;
        this.#regenerationQueue.delete(chunkID);
        return chunkIDToCoords(chunkID);
      } else {
        let [ playerCx, playerCy, playerCz ] = this.getPlayerChunk();
        let minChunkDist = null;
        let minCx, minCy, minCz;
        for (let chunkID of this.#regenerationQueue) {
          let [ cx, cy, cz ] = chunkIDToCoords(chunkID);
          let deltaX = cx - playerCx;
          let deltaY = cy - playerCy;
          let deltaZ = cz - playerCz;
          let chunkDist = Math.hypot(Number(deltaX), Number(deltaY), Number(deltaZ));
          if (minChunkDist == null || chunkDist < minChunkDist) {
            minChunkDist = chunkDist;
            minCx = cx;
            minCy = cy;
            minCz = cz;
          }
        }
        this.#removeFromRegenQueue(minCx, minCy, minCz);
        return [minCx, minCy, minCz];
      }
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
    let now = Date.now();
    
    for (let i = 0; i < MAX_REGEN_QUEUE_PER_FRAME; i++) {
      let chunkPos = this.#popOneFromRegenQueue();
      if (chunkPos == null) break;
      let [ cx, cy, cz ] = chunkPos;
      this.regenerateMesh(cx, cy, cz);
      if (Date.now() - now > MAX_REGEN_MILLIS_PER_FRAME) break;
    }
  }
}
