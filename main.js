const engine = new BABYLON.Engine(canvas, true);

let playerPos = new WorldPos();
let chunkStore = new ChunkManager();
let invSlot = 1;
let queuedDeltaX = 0, queuedDeltaY = 0, queuedDeltaZ = 0;

let chunkRenderer;
let camera;

function updatePosText() {
  let [ xString, yString, zString ] = playerPos.toStringArray();
  x_value.textContent = xString;
  y_value.textContent = yString;
  z_value.textContent = zString;
}

function updateRotText() {
  let horzAngle = camera.rotation.y / Math.PI * 180;
  let vertAngle = -camera.rotation.x / Math.PI * 180;
  if (horzAngle < 0) horzAngle += 360;
  
  let rotSections = ROTATION_SECTION_ANGLE_PRECISIONS[ROTATION_SECTION_PRECISION];
  let rotSectionNames = ROTATION_SECTION_NAMES[ROTATION_SECTION_PRECISION];
  
  let horzAngleSection = Math.floor((horzAngle + 360 / rotSections / 2) / 360 * rotSections);
  if (horzAngleSection >= rotSections) horzAngleSection -= rotSections;
  
  horz_angle.textContent = horzAngle.toFixed(FLOAT_NUMBER_PREC);
  horz_angle_symbol.textContent = rotSectionNames[horzAngleSection];
  vert_angle.textContent = vertAngle.toFixed(FLOAT_NUMBER_PREC);
}

function updateInvSlotText() {
  inv_id.textContent = invSlot;
  inv_name.textContent = BLOCKS[invSlot];
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
  if (invSlot >= BLOCKS.length) {
    invSlot = BLOCKS.length - 1;
  }
  updateInvSlotText();
}

function breakBlockAtFacing() {
  
}

function placeBlockAtFacing() {
  
}

function createScene() {
  const scene = new BABYLON.Scene(engine);
  
  for (let [ blockName, blockData ] of BLOCK_DATA.entries()) {
    if (blockData.render) {
      blockData.material = new BABYLON.StandardMaterial(`${blockName}::material`, scene);
      blockData.textureObj = new BABYLON.Texture(blockData.texture, scene);
      blockData.material.diffuseTexture = blockData.textureObj;
    }
  }
  BLOCKS = Array.from(BLOCK_DATA.keys());
  
  updateInvSlotText();
  
  playerPos.translateByNumbers(0, 4.5, 0);
  updatePosText();
  
  camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 0, 0), scene);
  camera.inertia = 0;
  camera.angularSensibility = 500;
  camera.attachControl();
  camera.inputs.remove(camera.inputs.attached.keyboard);
  
  updateRotText();
  
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  
  // https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox
  const skyboxTexture = new BABYLON.CubeTexture(texArrayFromBlockData(SKYBOX_DATA)[0], scene, null, null, texArrayFromBlockData(SKYBOX_DATA));
  scene.createDefaultSkybox(skyboxTexture, false, 1000);
  
  chunkRenderer = new ChunkRenderer(playerPos, chunkStore);
  
  //const plane = BABYLON.MeshBuilder.CreatePlane();
  //plane.material = BLOCK_DATA.get('inf_voxel_test:stone').material;
  //plane.position = new BABYLON.Vector3(0, 0, 5);
  //plane.rotation = new BABYLON.Vector3(0, Math.PI / 2 * 0.97, 0);
  
  /*scene.onKeyboardObservable = evt => {
    if (evt.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
      console.log(evt.code);
    }
  };*/
  
  scene.onPointerDown = evt => {
    // https://github.com/il-m-yamagishi/babylon-fps-shooter/blob/main/src/MainScene.ts#L107
    if (evt.button == MOUSE_CODES.LEFT) {
      if (!engine.isPointerLock) {
        engine.enterPointerlock();
      }
    }
    
    if (evt.button == MOUSE_CODES.LEFT) {
      breakBlockAtFacing();
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
          (rightPressed - leftPressed) * MOVEMENT_SPEED * scene.deltaTime / 1000,
          0,
          (forwardPressed - backwardPressed) * MOVEMENT_SPEED * scene.deltaTime / 1000
        );
        
        let result = BABYLON.Vector3.Zero();
        unTransformedMvmt.rotateByQuaternionToRef(quat, result);
        
        result.y += (upPressed - downPressed) * MOVEMENT_SPEED * scene.deltaTime / 1000;
        
        queuedDeltaX += result.x;
        queuedDeltaY += result.y;
        queuedDeltaZ += result.z;
      }
    }
    
    if (queuedDeltaX != 0 || queuedDeltaY != 0 || queuedDeltaZ != 0) {
      playerPos.translateByNumbers(queuedDeltaX, queuedDeltaY, queuedDeltaZ);
      chunkRenderer.updatePlayerPos(playerPos);
      updatePosText();
      
      queuedDeltaX = 0;
      queuedDeltaY = 0;
      queuedDeltaZ = 0;
    }
    
    chunkRenderer.regenFromRegenQueue();
  };
  
  let frameTimes = new Array(FPS_AVG_FRAMES).fill(0);
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
  
  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

addEventListener('resize', () => engine.resize());

mainPageManager.switchPage("Game");
engine.resize();

//center=new WorldPos();vll=setInterval(()=>{let d=playerPos.approxDistTo(center);if(Number.isFinite(d*100))MOVEMENT_SPEED=d*1;},50)
