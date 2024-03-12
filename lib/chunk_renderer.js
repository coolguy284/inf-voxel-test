class ChunkRenderer {
  #playerPos = new WorldPos();
  #chunkStore;
  
  constructor(playerPos, chunkStore) {
    this.#chunkStore = chunkStore;
    this.updatePlayerPos(playerPos);
    this.regenerateMeshes();
  }
  
  getPlayerChunk() {
    let [ cx, cy, cz ] = blockCoordsToChunkCoords(this.#playerPos.getBlockX(), this.#playerPos.getBlockY(), this.#playerPos.getBlockZ());
    return [cx, cy, cz];
  }
  
  regenerateMeshes() {
    let [ baseCx, baseCy, baseCz ] = this.getPlayerChunk();
    
    let blockTruePos = new WorldPos();
    blockTruePos.setFracX(0.5);
    blockTruePos.setFracY(0.5);
    blockTruePos.setFracZ(0.5);
    
    for (let deltaCy = -CHUNK_RENDER_RADIUS_BIGINT; deltaCy <= CHUNK_RENDER_RADIUS_BIGINT; deltaCy++) {
      for (let deltaCz = -CHUNK_RENDER_RADIUS_BIGINT; deltaCz <= CHUNK_RENDER_RADIUS_BIGINT; deltaCz++) {
        for (let deltaCx = -CHUNK_RENDER_RADIUS_BIGINT; deltaCx <= CHUNK_RENDER_RADIUS_BIGINT; deltaCx++) {
          let cx = baseCx + deltaCx;
          let cy = baseCy + deltaCy;
          let cz = baseCz + deltaCz;
          
          let chunk = this.#chunkStore.getChunkAt(cx, cy, cz);
          
          let chunkMeshes = chunk.getMeshes();
          chunkMeshes.forEach(x => x.dispose());
          chunkMeshes.length = 0;
          
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
        }
      }
    }
  }
  
  updatePlayerPos(playerPos) {
    this.#playerPos.copyFrom(playerPos);
  }
}
