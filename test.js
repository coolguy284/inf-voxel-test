function test_chunk_basic() {
  let chunk = new Chunk();
  
  console.log(chunk.getBlockAt(7, 8, 10));
  console.log(chunk.getBlockAt(7, 8, 9));
}

function test_all() {
  test_chunk_basic();
}