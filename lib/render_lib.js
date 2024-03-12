function texArrayFromBlockData(blockData) {
  // px, py, pz, nx, ny, nz: right, top, back, left, bottom, front
  return [
    blockData.right,
    blockData.top,
    blockData.back,
    blockData.left,
    blockData.bottom,
    blockData.front,
  ];
}
