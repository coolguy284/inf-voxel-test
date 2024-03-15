function validateBigIntCoords(x, y, z) {
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

function blockCoordsToChunkCoords(x, y, z) {
  validateBigIntCoords(x, y, z);
  
  let cx, cy, cz;
  
  if (x < 0n) {
    cx = (x - worldData.chunkSizeBigintRuntime + 1n) / worldData.chunkSizeBigintRuntime;
  } else {
    cx = x / worldData.chunkSizeBigintRuntime;
  }
  
  if (y < 0n) {
    cy = (y - worldData.chunkSizeBigintRuntime + 1n) / worldData.chunkSizeBigintRuntime;
  } else {
    cy = y / worldData.chunkSizeBigintRuntime;
  }
  
  if (z < 0n) {
    cz = (z - worldData.chunkSizeBigintRuntime + 1n) / worldData.chunkSizeBigintRuntime;
  } else {
    cz = z / worldData.chunkSizeBigintRuntime;
  }
  
  let bx = (Number(x % worldData.chunkSizeBigintRuntime) + worldData.chunkSize) % worldData.chunkSize;
  let by = (Number(y % worldData.chunkSizeBigintRuntime) + worldData.chunkSize) % worldData.chunkSize;
  let bz = (Number(z % worldData.chunkSizeBigintRuntime) + worldData.chunkSize) % worldData.chunkSize;
  
  return [cx, cy, cz, bx, by, bz];
}

function chunkCoordsToBlockCoords(cx, cy, cz, bx, by, bz) {
  return [
    cx * worldData.chunkSizeBigintRuntime + BigInt(bx),
    cy * worldData.chunkSizeBigintRuntime + BigInt(by),
    cz * worldData.chunkSizeBigintRuntime + BigInt(bz),
  ];
}

function chunkCoordsToID(cx, cy, cz) {
  return cx + ',' + cy + ',' + cz;
}

function chunkIDToCoords(chunkID) {
  let chunkPosStrings = chunkID.split(',');
  return [
    BigInt(chunkPosStrings[0]),
    BigInt(chunkPosStrings[1]),
    BigInt(chunkPosStrings[2]),
  ];
}

// returns the chunks in the von neumann neighborhood of a block (incl block itself)
function chunksInVonNeumannNeighborhood(x, y, z) {
  let [ cx, cy, cz, bx, by, bz ] = blockCoordsToChunkCoords(x, y, z);
  
  let chunks = [[cx, cy, cz]];
  
  if (bx == 0) {
    chunks.push([cx - 1n, cy, cz]);
  }
  
  if (by == 0) {
    chunks.push([cx, cy - 1n, cz]);
  }
  
  if (bz == 0) {
    chunks.push([cx, cy, cz - 1n]);
  }
  
  if (bx == worldData.chunkSize - 1) {
    chunks.push([cx + 1n, cy, cz]);
  }
  
  if (by == worldData.chunkSize - 1) {
    chunks.push([cx, cy + 1n, cz]);
  }
  
  if (bz == worldData.chunkSize - 1) {
    chunks.push([cx, cy, cz + 1n]);
  }
  
  return chunks;
}
