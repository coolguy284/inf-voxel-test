class CommandRunner {
  parseString(string) {
    let [ command, ...args ] = string.split(' ');
    
    this.getCommandByName(command)(...args);
  }
  
  getCommandByName(name) {
    switch (name) {
      case 'help': return this.help;
      case 'teleport': return this.teleport;
      case 'teleportDim': return this.teleportDim;
      case 'teleportRelative': return this.teleportRelative;
      case 'setAngle': return this.setAngle;
      case 'setBlock': return this.setBlock;
      case 'setDimBlock': return this.setDimBlock;
      case 'setBlockAtPlayer': return this.setBlockAtPlayer;
      case 'setBlockRelative': return this.setBlockRelative;
      case 'resetChunk': return this.resetChunk;
      case 'fill': return this.fill;
      case 'copy': return this.copy;
      case 'move': return this.move;
      case 'listWaypoints': return this.listWaypoints;
      case 'addWaypointAtPlayer': return this.addWaypointAtPlayer;
      case 'addWaypoint': return this.addWaypoint;
      case 'removeWaypoint': return this.removeWaypoint;
      default: return null;
    }
  }
  
  help(command) {}
  
  teleport(xString, yString, zString) {}
  teleportDim(dimension, xString, yString, zString) {}
  teleportRelative(x, y, z) {}
  setAngle(horizontal, vertical) {}
  
  setBlock(blockX, blockY, blockZ, block) {}
  setDimBlock(dimension, blockX, blockY, blockZ, block) {}
  setBlockAtPlayer(block) {}
  setBlockRelative(x, y, z, block) {}
  resetChunk(chunkX, chunkY, chunkZ) {}
  fill(bxStart, bxEnd, byStart, byEnd, bzStart, bzEnd, block) {}
  copy(bxStart, bxEnd, byStart, byEnd, bzStart, bzEnd, bxOut, byOut, bzOut, block) {}
  move(bxStart, bxEnd, byStart, byEnd, bzStart, bzEnd, bxOut, byOut, bzOut, block) {}
  
  listWaypoints() {}
  addWaypointAtPlayer() {}
  addWaypoint(dimension, xString, yString, zString, name, r, g, b) {}
  removeWaypoint(name) {}
}
