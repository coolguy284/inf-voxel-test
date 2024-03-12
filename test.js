function test_chunk_basic() {
  console.log('basic test');
  
  let chunk = new Chunk();
  
  console.log(chunk.getBlockAt(7, 8, 10));
  console.log(chunk.getBlockAt(7, 8, 9));
  
  chunk.setBlockAt(7, 8, 9, 'inf_voxel_test:stone');
  
  console.log(chunk.getBlockAt(7, 8, 10));
  console.log(chunk.getBlockAt(7, 8, 9));
  
  console.log(chunk);
  
  console.log('basic test finished');
}

function test_all() {
  test_chunk_basic();
}
