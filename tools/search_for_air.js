function findMaxInput(func) {
  let lowEnough = 0n;
  let tooHigh = 1n;
  
  let logValues = () => {
    console.log(`lowEnough = ${lowEnough}; tooHigh = ${tooHigh}`);
  };
  
  logValues();
  
  // raise tooHigh
  while (func(tooHigh)) {
    lowEnough = tooHigh;
    tooHigh *= 2n;
    logValues();
  }
  
  // now tooHigh is too high, perform binary search
  while (tooHigh - lowEnough > 1n) {
    let guess = (lowEnough + tooHigh) / 2n;
    
    let result = func(guess);
    
    if (result) {
      // guess still valid
      lowEnough = guess;
    } else {
      // guess is invalid
      tooHigh = guess;
    }
    
    logValues();
  }
  
  // lowEnough is now highest valid input
  return lowEnough;
}

(() => {
  let origPlayerPos = new WorldPos();
  origPlayerPos.copyFrom(playerPos);
  findMaxInput(x => {
    playerPos.setBlockZ(origPlayerPos.getBlockZ() + x);
    return chunkStore.getBlockAt(playerPos.getBlockX(), playerPos.getBlockY(), playerPos.getBlockZ()) == 'inf_voxel_test:air' && String(x).length < 2000;
  });
})();
