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
  
  console.log('chunk manager test finished');
}

function test_all() {
  test_chunk();
  test_chunk_manager();
}
