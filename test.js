function test_chunk() {
  console.log('chunk test');
  
  let chunk = new Chunk();
  
  console.log(chunk.getBlockAt(7, 8, 10));
  console.log(chunk.getBlockAt(7, 8, 9));
  
  chunk.setBlockAt(7, 8, 9, 'inf_voxel_test:stone');
  
  console.log(chunk.getBlockAt(7, 8, 10));
  console.log(chunk.getBlockAt(7, 8, 9));
  
  console.log('chunk test finished');
}

function test_chunk_manager() {
  console.log('chunk manager test');
  
  let chunkManager = new ChunkManager();
  
  console.log(chunkManager.getChunkAt(0n, -2n, 0n).getBlockAt(0, CHUNK_SIZE - 1, 0));
  console.log(chunkManager.getChunkAt(0n, -1n, 0n).getBlockAt(0, CHUNK_SIZE - 7, 0));
  console.log(chunkManager.getChunkAt(0n, -1n, 0n).getBlockAt(0, CHUNK_SIZE - 1, 0));
  console.log(chunkManager.getChunkAt(0n, 0n, 0n).getBlockAt(0, 0, 0));
  console.log(chunkManager.getChunkAt(0n, 0n, 0n).getBlockAt(0, 1, 0));
  console.log(chunkManager.getChunkAt(0n, 1n, 0n).getBlockAt(0, 0, 0));
  
  console.log();
  
  console.log(chunkManager.getBlockAt(0n, BigInt(-CHUNK_SIZE - 1), 0n));
  console.log(chunkManager.getBlockAt(0n, -7n, 0n));
  console.log(chunkManager.getBlockAt(0n, -1n, 0n));
  console.log(chunkManager.getBlockAt(0n, 0n, 0n));
  console.log(chunkManager.getBlockAt(0n, 1n, 0n));
  console.log(chunkManager.getBlockAt(0n, BigInt(CHUNK_SIZE), 0n));
  
  console.log('chunk manager test finished');
}

function test_world_pos() {
  console.log('world pos test');
  
  let worldPos1 = new WorldPos();
  worldPos1.setBlockX(0n);
  worldPos1.setBlockY(-1n);
  console.log(worldPos1.toString());
  
  let worldPos2 = new WorldPos();
  worldPos2.setBlockX(0n);
  worldPos2.setBlockY(-1n);
  worldPos2.setFracY(0.1);
  console.log(worldPos2.toString());
  
  let worldPos3 = new WorldPos();
  worldPos3.setBlockX(1n);
  worldPos3.setFracX(0.1);
  worldPos3.setBlockY(-2n);
  worldPos3.setFracY(0.1);
  console.log(worldPos3.toString());
  
  let worldPos4 = new WorldPos();
  worldPos4.setBlockX(1n);
  worldPos4.setFracX(1.1);
  worldPos4.setBlockY(-2n);
  worldPos4.setFracY(0.1);
  console.log(worldPos4.toString());
  
  console.log('world pos test finished');
}

function test_all() {
  test_chunk();
  test_chunk_manager();
  test_world_pos();
}
