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
    cx = (x - CHUNK_SIZE_BIGINT) / CHUNK_SIZE_BIGINT;
  } else {
    cx = x / CHUNK_SIZE_BIGINT;
  }
  
  if (y < 0n) {
    cy = (y - CHUNK_SIZE_BIGINT) / CHUNK_SIZE_BIGINT;
  } else {
    cy = y / CHUNK_SIZE_BIGINT;
  }
  
  if (z < 0n) {
    cz = (z - CHUNK_SIZE_BIGINT) / CHUNK_SIZE_BIGINT;
  } else {
    cz = z / CHUNK_SIZE_BIGINT;
  }
  
  let bx = (Number(x % CHUNK_SIZE_BIGINT) + CHUNK_SIZE) % CHUNK_SIZE;
  let by = (Number(y % CHUNK_SIZE_BIGINT) + CHUNK_SIZE) % CHUNK_SIZE;
  let bz = (Number(z % CHUNK_SIZE_BIGINT) + CHUNK_SIZE) % CHUNK_SIZE;
  
  return [cx, cy, cz, bx, by, bz];
}
