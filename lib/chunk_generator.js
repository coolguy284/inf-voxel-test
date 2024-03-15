function generateChunkAt(cx, cy, cz, chunk) {
  let worldGenMode = worldData.getWorldGenMode(playerPos.getDimension());
  if (worldGenMode == 0) {
    generateChunkAt_Mode0(cx, cy, cz, chunk);
  } else if (worldGenMode == 1) {
    generateChunkAt_Mode1(cx, cy, cz, chunk);
  } else if (worldGenMode == 2) {
    generateChunkAt_Mode2(cx, cy, cz, chunk);
  }
}

function generateChunkAt_Mode0(cx, cy, cz, chunk) {
  let rng;
  if (cy == 0n) {
    let seed = xmur3(chunkCoordsToID(cx, cy, cz));
    rng = new sfc32(seed(), seed(), seed(), seed());
  }
  
  for (let by = 0; by < worldData.chunkSize; by++) {
    for (let bz = 0; bz < worldData.chunkSize; bz++) {
      for (let bx = 0; bx < worldData.chunkSize; bx++) {
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
            if (rng.getFloat0To1() > 0.1) {
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
}

function generateChunkAt_Mode1(cx, cy, cz, chunk) {
  let seed = xmur3(chunkCoordsToID(cx, cy, cz));
  let rng = new sfc32(seed(), seed(), seed(), seed());
  
  for (let by = 0; by < worldData.chunkSize; by++) {
    for (let bz = 0; bz < worldData.chunkSize; bz++) {
      for (let bx = 0; bx < worldData.chunkSize; bx++) {
        let [ x, y, z ] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
        let dist = Math.hypot(Number(x), Number(y), Number(z));
        if (dist < 6371000) {
          let value = rng.getFloat0To1();
          if (value > 0.2) {
            chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:grass');
          } else if (value > 0.1) {
            chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:dirt');
          } else {
            chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
          }
        }
      }
    }
  }
}

function generateChunkAt_Mode2(cx, cy, cz, chunk) {
  let seed = xmur3(chunkCoordsToID(cx, cy, cz));
    let rng = new sfc32(seed(), seed(), seed(), seed());
    
    for (let by = 0; by < worldData.chunkSize; by++) {
      for (let bz = 0; bz < worldData.chunkSize; bz++) {
        for (let bx = 0; bx < worldData.chunkSize; bx++) {
          try {
            let [ x, y, z ] = chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz);
            
            let horzDist = Math.hypot(Number(x), Number(z));
            
            y += BigInt(Math.round(Math.sin(horzDist / 20) * 20));
            
            if (y >= 2n && y <= 4n || y >= 6n) {
              // empty
            } else if (y == 1n || y == 5n) {
              // empty unless at 0, 0
              if (x == 0n && z == 0n) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
              }
            } else if (y == 0n) {
              // stone at 4, 4 corners; 10% dirt, 90% grass otherwise
              if (x % 4n == 0n && z % 4n == 0n) {
                chunk.setBlockAt(bx, by, bz, 'inf_voxel_test:stone');
              } else {
                if (rng.getFloat0To1() > 0.1) {
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
          } catch {}
        }
      }
    }
}
