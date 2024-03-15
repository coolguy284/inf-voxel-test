function texArrayFromBlockData(blockData) {
  // px, py, pz, nx, ny, nz: right, top, back, left, bottom, front
  return [
    blockData.posX,
    blockData.posY,
    blockData.posZ,
    blockData.negX,
    blockData.negY,
    blockData.negZ,
  ];
}
