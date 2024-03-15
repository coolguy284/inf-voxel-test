class WorldPos {
  // block coords are bigints, frac coords are doubles from 0 to 1
  #blockX = 0n;
  #blockY = 0n;
  #blockZ = 0n;
  #fracX = 0;
  #fracY = 0;
  #fracZ = 0;
  
  getBlockX() {
    return this.#blockX;
  }
  
  setBlockX(newBlockX) {
    this.#blockX = newBlockX;
  }
  
  getBlockY() {
    return this.#blockY;
  }
  
  setBlockY(newBlockY) {
    this.#blockY = newBlockY;
  }
  
  getBlockZ() {
    return this.#blockZ;
  }
  
  setBlockZ(newBlockZ) {
    this.#blockZ = newBlockZ;
  }
  
  getFracX() {
    return this.#fracX;
  }
  
  setFracX(newFracX) {
    this.#fracX = newFracX;
    
    if (this.#fracX >= 1 || this.#fracX < 0) {
      let excess = Math.floor(this.#fracX);
      this.#blockX += BigInt(excess);
      this.#fracX -= excess;
    }
  }
  
  getFracY() {
    return this.#fracY;
  }
  
  setFracY(newFracY) {
    this.#fracY = newFracY;
    
    if (this.#fracY >= 1 || this.#fracY < 0) {
      let excess = Math.floor(this.#fracY);
      this.#blockY += BigInt(excess);
      this.#fracY -= excess;
    }
  }
  
  getFracZ() {
    return this.#fracZ;
  }
  
  setFracZ(newFracZ) {
    this.#fracZ = newFracZ;
    
    if (this.#fracZ >= 1 || this.#fracZ < 0) {
      let excess = Math.floor(this.#fracZ);
      this.#blockZ += BigInt(excess);
      this.#fracZ -= excess;
    }
  }
  
  static #componentString(block, frac) {
    if (block >= 0n) {
      return `${block}.${frac.toFixed(gameSettings.fixedNumberPrec).slice(2)}`;
    } else {
      return `${frac == 0 ? block : (block == -1n ? '-0' : block + 1n)}.${(1 - frac).toFixed(gameSettings.fixedNumberPrec).slice(2)}`;
    }
  }
  
  toStringArray() {
    let xString = WorldPos.#componentString(this.#blockX, this.#fracX);
    let yString = WorldPos.#componentString(this.#blockY, this.#fracY);
    let zString = WorldPos.#componentString(this.#blockZ, this.#fracZ);
    
    return [xString, yString, zString];
  }
  
  toString() {
    let [ xString, yString, zString ] = this.toStringArray();
    return `${xString}, ${yString}, ${zString}`;
  }
  
  toLowPrecCoords() {
    return [
      Number(this.#blockX) + this.#fracX,
      Number(this.#blockY) + this.#fracY,
      Number(this.#blockZ) + this.#fracZ,
    ];
  }
  
  copyFrom(worldPos) {
    this.setBlockX(worldPos.getBlockX());
    this.setBlockY(worldPos.getBlockY());
    this.setBlockZ(worldPos.getBlockZ());
    this.setFracX(worldPos.getFracX());
    this.setFracY(worldPos.getFracY());
    this.setFracZ(worldPos.getFracZ());
  }
  
  reNormalize() {
    if (this.#fracX >= 1 || this.#fracX < 0) {
      let excess = Math.floor(this.#fracX);
      this.#blockX += BigInt(excess);
      this.#fracX -= excess;
    }
    
    if (this.#fracY >= 1 || this.#fracY < 0) {
      let excess = Math.floor(this.#fracY);
      this.#blockY += BigInt(excess);
      this.#fracY -= excess;
    }
    
    if (this.#fracZ >= 1 || this.#fracZ < 0) {
      let excess = Math.floor(this.#fracZ);
      this.#blockZ += BigInt(excess);
      this.#fracZ -= excess;
    }
  }
  
  translateByNumbers(x, y, z) {
    this.#fracX += x;
    this.#fracY += y;
    this.#fracZ += z;
    this.reNormalize();
  }
  
  subtract(other) {
    let result = new WorldPos();
    result.setBlockX(this.getBlockX() - other.getBlockX());
    result.setBlockY(this.getBlockY() - other.getBlockY());
    result.setBlockZ(this.getBlockZ() - other.getBlockZ());
    result.setFracX(this.getFracX() - other.getFracX());
    result.setFracY(this.getFracY() - other.getFracY());
    result.setFracZ(this.getFracZ() - other.getFracZ());
    return result;
  }
  
  approxDistTo(other) {
    let diff = this.subtract(other);
    return Math.hypot(...diff.toLowPrecCoords());
  }
}

class WorldPosDim extends WorldPos {
  #dimension = null;
  
  constructor(dimension) {
    super();
    this.#dimension = dimension;
  }
  
  getDimension() {
    return this.#dimension;
  }
  
  setDimension(dimension) {
    this.#dimension = dimension;
  }
  
  toStringArray() {
    return [
      this.#dimension,
      ...super.toStringArray(),
    ];
  }
  
  toString() {
    return `${this.#dimension}: ${super.toString()}`;
  }
  
  toLowPrecCoords() {
    return [
      this.#dimension,
      ...super.toLowPrecCoords(),
    ];
  }
  
  copyFrom(worldPosDim) {
    super.copyFrom(worldPosDim);
    this.setDimension(worldPosDim.getDimension());
  }
}
