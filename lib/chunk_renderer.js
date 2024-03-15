class ChunkRenderer {
  #playerPos = new WorldPosDim();
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
    return [this.#playerPos.getDimension(), cx, cy, cz];
  }
  
  regenerateMesh(dimension, cx, cy, cz) {
    let blockTruePos = new WorldPos();
    blockTruePos.setFracX(0.5);
    blockTruePos.setFracY(0.5);
    blockTruePos.setFracZ(0.5);
    
    this.clearMesh(dimension, cx, cy, cz);
    
    let chunk = this.#chunkStore.getChunkAt(dimension, cx, cy, cz);
    let chunkMeshes = chunk.getMeshes();
    
    for (let by = 0; by < worldData.chunkSize; by++) {
      for (let bz = 0; bz < worldData.chunkSize; bz++) {
        for (let bx = 0; bx < worldData.chunkSize; bx++) {
          let blockName = chunk.getBlockAt(bx, by, bz);
          let blockData = worldData.blockData.get(blockName);
          if (blockData.renderMode != BLOCK_RENDER.NONE) {
            let [x, y, z] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
            let negXEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x - 1n, y, z)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let posXEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x + 1n, y, z)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let negYEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x, y - 1n, z)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let posYEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x, y + 1n, z)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let negZEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x, y, z - 1n)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let posZEmpty = worldData.blockData.get(this.#chunkStore.getBlockAt(dimension, x, y, z + 1n)).renderMode != BLOCK_RENDER.NO_ALPHA;
            let cubeVisible = negXEmpty || posXEmpty || negYEmpty || posYEmpty || negZEmpty || posZEmpty;
            if (cubeVisible) {
              blockTruePos.setBlockX(x);
              blockTruePos.setBlockY(y);
              blockTruePos.setBlockZ(z);
              let cubeCenter = new BABYLON.Vector3(...blockTruePos.subtract(this.#playerPos).toLowPrecCoords());
              let blockDataRuntime = worldData.blockDataRuntime.get(blockName);
              if (negXEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negXPos);
                faceMesh.rotation = ChunkRenderer.#negXRot;
                chunkMeshes.push(faceMesh);
              }
              if (posXEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#posXPos);
                faceMesh.rotation = ChunkRenderer.#posXRot;
                chunkMeshes.push(faceMesh);
              }
              if (negYEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negYPos);
                faceMesh.rotation = ChunkRenderer.#negYRot;
                chunkMeshes.push(faceMesh);
              }
              if (posYEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#posYPos);
                faceMesh.rotation = ChunkRenderer.#posYRot;
                chunkMeshes.push(faceMesh);
              }
              if (negZEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
                faceMesh.renderingGroupId = 1;
                faceMesh.position = cubeCenter.add(ChunkRenderer.#negZPos);
                faceMesh.rotation = ChunkRenderer.#negZRot;
                chunkMeshes.push(faceMesh);
              }
              if (posZEmpty) {
                let faceMesh = BABYLON.MeshBuilder.CreatePlane(`${blockName}::mesh`, { size: 1 });
                faceMesh.material = blockDataRuntime.material;
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
    
    this.#chunkStore.setChunkActiveMesh(dimension, cx, cy, cz);
  }
  
  clearMesh(dimension, cx, cy, cz) {
    let chunk = this.#chunkStore.getChunkAt(dimension, cx, cy, cz);
    
    let chunkMeshes = chunk.getMeshes();
    chunkMeshes.forEach(x => x.dispose());
    chunkMeshes.length = 0;
    
    this.#chunkStore.clearChunkActiveMesh(dimension, cx, cy, cz);
  }
  
  clearMeshes() {
    this.#regenerationQueue.clear();
    for (let [ dimension, cx, cy, cz ] of this.#chunkStore.getAllChunksActiveMesh()) {
      this.clearMesh(dimension, cx, cy, cz);
    }
  }
  
  #appendToRegenQueue(dimension, cx, cy, cz) {
    this.#regenerationQueue.add(chunkCoordsToID(dimension, cx, cy, cz));
  }
  
  #getAllRegenQueue() {
    return Array.from(this.#regenerationQueue).map(x => chunkIDToCoords(x));
  }
  
  #removeFromRegenQueue(dimension, cx, cy, cz) {
    this.#regenerationQueue.delete(chunkCoordsToID(dimension, cx, cy, cz));
  }
  
  #popOneFromRegenQueue() {
    if (this.#regenerationQueue.size > 0) {
      if (gameSettings.chunkRenderingOrder == 0) {
        let chunkID = this.#regenerationQueue.values().next().value;
        this.#regenerationQueue.delete(chunkID);
        return chunkIDToCoords(chunkID);
      } else {
        let [ dimension, playerCx, playerCy, playerCz ] = this.getPlayerChunk();
        let minChunkDist = null;
        let minDimension, minCx, minCy, minCz;
        for (let chunkID of this.#regenerationQueue) {
          let [ cDimension, cx, cy, cz ] = chunkIDToCoords(chunkID);
          let deltaX = cx - playerCx;
          let deltaY = cy - playerCy;
          let deltaZ = cz - playerCz;
          let chunkDist;
          if (cDimension != dimension) {
            chunkDist = Infinity;
          } else {
            chunkDist = Math.hypot(Number(deltaX), Number(deltaY), Number(deltaZ));
          }
          if (minChunkDist == null || chunkDist < minChunkDist) {
            minChunkDist = chunkDist;
            minDimension = cDimension;
            minCx = cx;
            minCy = cy;
            minCz = cz;
          }
        }
        this.#removeFromRegenQueue(minDimension, minCx, minCy, minCz);
        return [minDimension, minCx, minCy, minCz];
      }
    } else {
      return null;
    }
  }
  
  regenerateMeshes() {
    let [ dimension, baseCx, baseCy, baseCz ] = this.getPlayerChunk();
    
    for (let deltaCy = -gameSettings.chunkRenderRadiusBigint; deltaCy <= gameSettings.chunkRenderRadiusBigint; deltaCy++) {
      for (let deltaCz = -gameSettings.chunkRenderRadiusBigint; deltaCz <= gameSettings.chunkRenderRadiusBigint; deltaCz++) {
        for (let deltaCx = -gameSettings.chunkRenderRadiusBigint; deltaCx <= gameSettings.chunkRenderRadiusBigint; deltaCx++) {
          let cx = baseCx + deltaCx;
          let cy = baseCy + deltaCy;
          let cz = baseCz + deltaCz;
          
          this.#appendToRegenQueue(dimension, cx, cy, cz);
        }
      }
    }
  }
  
  updateMeshPositions(posDelta) {
    let [ dimension, baseCx, baseCy, baseCz ] = this.getPlayerChunk();
    
    let blockTruePos = new WorldPos();
    blockTruePos.setFracX(0.5);
    blockTruePos.setFracY(0.5);
    blockTruePos.setFracZ(0.5);
    
    // clear distant meshes
    for (let [ cDimension, cx, cy, cz ] of this.#chunkStore.getAllChunksActiveMesh()) {
      if (
        dimension != cDimension ||
        (cx < baseCx - gameSettings.chunkRenderRadiusBigint || cx > baseCx + gameSettings.chunkRenderRadiusBigint) ||
        (cy < baseCy - gameSettings.chunkRenderRadiusBigint || cy > baseCy + gameSettings.chunkRenderRadiusBigint) ||
        (cz < baseCz - gameSettings.chunkRenderRadiusBigint || cz > baseCz + gameSettings.chunkRenderRadiusBigint)
      ) {
        this.clearMesh(dimension, cx, cy, cz);
      }
    }
    
    for (let [ cDimension, cx, cy, cz ] of this.#getAllRegenQueue()) {
      if (
        dimension != cDimension ||
        (cx < baseCx - gameSettings.chunkRenderRadiusBigint || cx > baseCx + gameSettings.chunkRenderRadiusBigint) ||
        (cy < baseCy - gameSettings.chunkRenderRadiusBigint || cy > baseCy + gameSettings.chunkRenderRadiusBigint) ||
        (cz < baseCz - gameSettings.chunkRenderRadiusBigint || cz > baseCz + gameSettings.chunkRenderRadiusBigint)
      ) {
        this.#removeFromRegenQueue(dimension, cx, cy, cz);
      }
    }
    
    // update current meshes
    for (let deltaCy = -gameSettings.chunkRenderRadiusBigint; deltaCy <= gameSettings.chunkRenderRadiusBigint; deltaCy++) {
      for (let deltaCz = -gameSettings.chunkRenderRadiusBigint; deltaCz <= gameSettings.chunkRenderRadiusBigint; deltaCz++) {
        for (let deltaCx = -gameSettings.chunkRenderRadiusBigint; deltaCx <= gameSettings.chunkRenderRadiusBigint; deltaCx++) {
          let cx = baseCx + deltaCx;
          let cy = baseCy + deltaCy;
          let cz = baseCz + deltaCz;
          
          if (!this.#chunkStore.getChunkActiveMesh(dimension, cx, cy, cz)) {
            // chunk meshes need to be generated
            this.#appendToRegenQueue(dimension, cx, cy, cz);
          } else {
            // chunk meshes can be translated
            let chunk = this.#chunkStore.getChunkAt(dimension, cx, cy, cz);
            
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
    if (playerPos.getDimension() != this.#playerPos.getDimension()) {
      this.clearMeshes();
      this.regenerateMeshes();
      this.#playerPos.copyFrom(playerPos);
    } else {
      let posDelta = this.#playerPos.subtract(playerPos).toLowPrecCoords();
      this.#playerPos.copyFrom(playerPos);
      this.updateMeshPositions(new BABYLON.Vector3(...posDelta));
    }
  }
  
  regenFromRegenQueue() {
    let now = Date.now();
    
    for (let i = 0; i < gameSettings.maxChunkLoadsPerFrame; i++) {
      let chunkPos = this.#popOneFromRegenQueue();
      if (chunkPos == null) break;
      let [ dimension, cx, cy, cz ] = chunkPos;
      this.regenerateMesh(dimension, cx, cy, cz);
      if (Date.now() - now > gameSettings.maxChunkLoadMillisPerFrame) break;
    }
  }
  
  updateBlockAt(dimension, x, y, z) {
    for (let [ cx, cy, cz ] of chunksInVonNeumannNeighborhood(x, y, z)) {
      if (this.#chunkStore.getChunkActiveMesh(dimension, cx, cy, cz)) {
        this.regenerateMesh(dimension, cx, cy, cz);
      }
    }
  }
}
