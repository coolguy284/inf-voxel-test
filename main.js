const engine = new BABYLON.Engine(canvas, true);

let scene;

let worldData;
let gameSettings = new GameSettings();
let playerPos;
let invSlot = 1;
let queuedDeltaX = 0, queuedDeltaY = 0, queuedDeltaZ = 0, queuedDeltaDim = null;

let environmentRenderer;
let chunkRenderer;
let camera;

function updatePosText() {
  let [ dimension, xString, yString, zString ] = playerPos.toStringArray();
  dimension_value.textContent = dimension;
  x_value.textContent = xString;
  y_value.textContent = yString;
  z_value.textContent = zString;
}

function updateRotText() {
  let horzAngle = camera.rotation.y / Math.PI * 180;
  let vertAngle = -camera.rotation.x / Math.PI * 180;
  if (horzAngle < 0) horzAngle += 360;
  
  let rotSections = ROTATION_SECTION_ANGLE_PRECISIONS[gameSettings.compassRotationPrecision];
  let rotSectionNames = ROTATION_SECTION_NAMES[gameSettings.compassRotationPrecision];
  
  let horzAngleSection = Math.floor((horzAngle + 360 / rotSections / 2) / 360 * rotSections);
  if (horzAngleSection >= rotSections) horzAngleSection -= rotSections;
  
  horz_angle.textContent = horzAngle.toFixed(gameSettings.floatNumberPrec);
  horz_angle_symbol.textContent = rotSectionNames[horzAngleSection];
  vert_angle.textContent = vertAngle.toFixed(gameSettings.floatNumberPrec);
}

function updateInvSlotText() {
  inv_id.textContent = invSlot;
  inv_name.textContent = worldData.blockRuntimeIDToName.get(invSlot);
}

function updateHeadBlockText() {
  let headBlock = worldData.chunkStore.getBlockAt(playerPos.getDimension(), playerPos.getBlockX(), playerPos.getBlockY(), playerPos.getBlockZ());
  head_block_id.textContent = worldData.blockNameToRuntimeID.get(headBlock);
  head_block_name.textContent = headBlock;
}

function bumpPlayerPos(x, y, z) {
  queuedDeltaX += x;
  queuedDeltaY += y;
  queuedDeltaZ += z;
}

function prevInvItem() {
  invSlot--;
  if (invSlot < 0) {
    invSlot = 0;
  }
  updateInvSlotText();
}

function nextInvItem() {
  invSlot++;
  if (invSlot >= worldData.blockRuntimeIDToName.size) {
    invSlot = worldData.blockRuntimeIDToName.size - 1;
  }
  updateInvSlotText();
}

// returns [[x, y, z], [x, y, z]]; first is air right before block, second is block
function raycastForwardTillBlock(origPos, raycastDir) {
  let raycastPos = new WorldPos();
  
  raycastPos.copyFrom(origPos);
  
  let raycastStep = raycastDir.scale(gameSettings.blockRaycastStepSize);
  
  let [ stepX, stepY, stepZ ] = [raycastStep.x, raycastStep.y, raycastStep.z];
  
  let [ prevX, prevY, prevZ ] = [
    raycastPos.getBlockX(),
    raycastPos.getBlockY(),
    raycastPos.getBlockZ(),
  ];
  
  let emptyBlock = worldData.getEmptyBlock(playerPos.getDimension());
  
  for (let i = 0; i < gameSettings.blockRaycastMaxDist; i += gameSettings.blockRaycastStepSize) {
    raycastPos.translateByNumbers(stepX, stepY, stepZ);
    
    let blockAtRayPos = worldData.chunkStore.getBlockAt(raycastPos.getBlockX(), raycastPos.getBlockY(), raycastPos.getBlockZ());
    
    if (blockAtRayPos != emptyBlock) {
      break;
    }
    
    [ prevX, prevY, prevZ ] = [
      raycastPos.getBlockX(),
      raycastPos.getBlockY(),
      raycastPos.getBlockZ(),
    ];
  }
  
  return [
    [prevX, prevY, prevZ],
    [
      raycastPos.getBlockX(),
      raycastPos.getBlockY(),
      raycastPos.getBlockZ(),
    ],
  ];
}

function breakBlockAtFacing() {
  let [ [ _airX, _airY, _airZ ], [ blockX, blockY, blockZ ] ] = raycastForwardTillBlock(playerPos, camera.getForwardRay().direction);
  
  let emptyBlock = worldData.getEmptyBlock(playerPos.getDimension());
  
  worldData.chunkStore.setBlockAt(blockX, blockY, blockZ, emptyBlock);
  chunkRenderer.updateBlockAt(blockX, blockY, blockZ);
}

function placeBlockAtFacing() {
  let [ [ airX, airY, airZ ], [ _blockX, _blockY, _blockZ ] ] = raycastForwardTillBlock(playerPos, camera.getForwardRay().direction);
  
  worldData.chunkStore.setBlockAt(airX, airY, airZ, worldData.blockRuntimeIDToName.get(invSlot));
  chunkRenderer.updateBlockAt(airX, airY, airZ);
}

function createScene() {
  scene = new BABYLON.Scene(engine);
  
  worldData = new WorldData(scene);
  playerPos = new WorldPosDim(Array.from(worldData.dimensions.keys())[0]);
  
  playerPos.translateByNumbers(0, 4.5, 0);
  
  camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 0, 0), scene);
  camera.inertia = 0;
  camera.angularSensibility = 500;
  // https://forum.babylonjs.com/t/disable-camera-near-plane-clipping/33739
  camera.minZ = gameSettings.camMinDist;
  camera.attachControl();
  // https://forum.babylonjs.com/t/how-to-disable-arrows-keys/34102/3
  camera.inputs.remove(camera.inputs.attached.keyboard);
  
  if (gameSettings.screenSpaceAmbientOcclusion) {
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/SSAORenderPipeline
    const ssao = new BABYLON.SSAORenderingPipeline('ssao', scene, 0.75);
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', camera);
  }
  
  updateInvSlotText();
  updatePosText();
  updateHeadBlockText();
  updateRotText();
  
  environmentRenderer = new EnvironmentRenderer(playerPos, scene);
  chunkRenderer = new ChunkRenderer(playerPos, worldData.chunkStore);
  
  // https://doc.babylonjs.com/features/featuresDeepDive/scene/interactWithScenes#keyboard-interactions
  scene.onKeyboardObservable.add((evt) => {
    if (evt.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
      let code = evt.event.code;
      if (code == 'ArrowLeft') {
        prevInvItem();
      } else if (code == 'ArrowRight') {
        nextInvItem();
      }
    }
  });
  
  scene.onPointerDown = evt => {
    // https://github.com/il-m-yamagishi/babylon-fps-shooter/blob/main/src/MainScene.ts#L107
    if (evt.button == MOUSE_CODES.LEFT) {
      if (!engine.isPointerLock) {
        engine.enterPointerlock();
      } else {
        breakBlockAtFacing();
      }
    } else if (evt.button == MOUSE_CODES.RIGHT) {
      placeBlockAtFacing();
    }
  };
  
  // Modulo camera rotation value to keep it sane
  scene.onPointerMove = () => {
    camera.rotation.y = camera.rotation.y % (Math.PI * 2);
    updateRotText();
  };
  
  // https://playground.babylonjs.com/#H5813K
  const dsm = new BABYLON.DeviceSourceManager(engine);
  
  scene.beforeRender = () => {
    const keyboard = dsm.getDeviceSource(BABYLON.DeviceType.Keyboard);
    
    if (keyboard) {
      const forwardPressed = keyboard.getInput(KEY_CODES.KeyW);
      const backwardPressed = keyboard.getInput(KEY_CODES.KeyS);
      const leftPressed = keyboard.getInput(KEY_CODES.KeyA);
      const rightPressed = keyboard.getInput(KEY_CODES.KeyD);
      const upPressed = keyboard.getInput(KEY_CODES.Space);
      const downPressed = keyboard.getInput(KEY_CODES.KeyX);
      
      const mvmtPressed = forwardPressed || backwardPressed || leftPressed || rightPressed || upPressed || downPressed;
      
      if (mvmtPressed) {
        const horizontalAngle = camera.rotation.y;
        
        // https://forum.babylonjs.com/t/simplest-way-to-rotate-vector-by-euler-angles/9389
        const quat = BABYLON.Quaternion.FromEulerAngles(0, horizontalAngle, 0);
        
        const unTransformedMvmt = new BABYLON.Vector3(
          (rightPressed - leftPressed) * gameSettings.movementSpeed * scene.deltaTime / 1000,
          0,
          (forwardPressed - backwardPressed) * gameSettings.movementSpeed * scene.deltaTime / 1000
        );
        
        let result = BABYLON.Vector3.Zero();
        unTransformedMvmt.rotateByQuaternionToRef(quat, result);
        
        result.y += (upPressed - downPressed) * gameSettings.movementSpeed * scene.deltaTime / 1000;
        
        queuedDeltaX += result.x;
        queuedDeltaY += result.y;
        queuedDeltaZ += result.z;
      }
    }
    
    if (queuedDeltaX != 0 || queuedDeltaY != 0 || queuedDeltaZ != 0) {
      playerPos.translateByNumbers(queuedDeltaX, queuedDeltaY, queuedDeltaZ);
      chunkRenderer.updatePlayerPos(playerPos);
      updatePosText();
      updateHeadBlockText();
      
      queuedDeltaX = 0;
      queuedDeltaY = 0;
      queuedDeltaZ = 0;
    }
    
    if (queuedDeltaDim != null) {
      playerPos.setDimension(queuedDeltaDim);
      chunkRenderer.updatePlayerPos(playerPos);
      environmentRenderer.updatePlayerPos(playerPos);
      updatePosText();
      updateHeadBlockText();
      
      queuedDeltaDim = null;
    }
    
    chunkRenderer.regenFromRegenQueue();
  };
  
  let frameTimes = new Array(gameSettings.fpsAvgFrames).fill(0);
  let frameTimesSum = 0;
  let frameIndex = 0;
  
  scene.afterRender = () => {
    if (scene.deltaTime) {
      frameTimesSum -= frameTimes[frameIndex];
      frameTimes[frameIndex] = scene.deltaTime;
      frameTimesSum += frameTimes[frameIndex];
      frameIndex++;
      if (frameIndex >= frameTimes.length) {
        frameIndex = 0;
      }
      
      let avgDeltaTime = frameTimesSum / frameTimes.length;
      let minDeltaTime = frameTimes.reduce((a, c) => c < a ? c : a);
      let maxDeltaTime = frameTimes.reduce((a, c) => c > a ? c : a);
      
      fps_value.textContent = Math.round(1000 / avgDeltaTime);
      fps_min_value.textContent = Math.round(1000 / maxDeltaTime);
      fps_max_value.textContent = Math.round(1000 / minDeltaTime);
    }
  };
}

createScene();

engine.runRenderLoop(() => {
  scene.render();
});

addEventListener('resize', () => engine.resize());

mainPageManager.switchPage('Game');
engine.resize();

//center=new WorldPos();vll=setInterval(()=>{let d=playerPos.approxDistTo(center);if(Number.isFinite(d*100))MOVEMENT_SPEED=d*1;},50)
