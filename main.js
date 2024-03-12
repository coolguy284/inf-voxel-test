const engine = new BABYLON.Engine(canvas, true);

let playerPos = new WorldPos();
let chunkStore = new ChunkManager();
let chunkRenderer;
let queuedDeltaX = 0, queuedDeltaY = 0, queuedDeltaZ = 0;

function updatePlayerText() {
  let [ xString, yString, zString ] = playerPos.toStringArray();
  x_value.textContent = xString;
  y_value.textContent = yString;
  z_value.textContent = zString;
}

function bumpPlayerPos(x, y, z) {
  queuedDeltaX += x;
  queuedDeltaY += y;
  queuedDeltaZ += z;
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
  playerPos.translateByNumbers(0, 11.5, 0);
  updatePlayerText();
  
  const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 0, 0), scene);
  camera.inertia = 0;
  camera.angularSensibility = 500;
  camera.attachControl();
  
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  
  // https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox
  const skyboxTexture = new BABYLON.CubeTexture(texArrayFromBlockData(SKYBOX_DATA)[0], scene, null, null, texArrayFromBlockData(SKYBOX_DATA));
  scene.createDefaultSkybox(skyboxTexture, false, 1000);
  
  chunkRenderer = new ChunkRenderer(playerPos, chunkStore);
  
  scene.onPointerDown = () => {
    // https://github.com/il-m-yamagishi/babylon-fps-shooter/blob/main/src/MainScene.ts#L107
    if (!engine.isPointerLock) {
      engine.enterPointerlock();
    }
  };
  
  // Modulo camera rotation value to keep it sane
  scene.onPointerMove = () => {
    camera.rotation.y = camera.rotation.y % (Math.PI * 2);
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
      updatePlayerText();
      
      queuedDeltaX = 0;
      queuedDeltaY = 0;
      queuedDeltaZ = 0;
    }
    
    chunkRenderer.regenFromRegenQueue();
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
