const engine = new BABYLON.Engine(canvas, true);

function createScene() {
  const scene = new BABYLON.Scene(engine);
  
  const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);
  
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.inertia = 0;
  camera.angularSensibility = 500;
  
  camera.attachControl();
  
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  
  light.intensity = 0.7;
  
  const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 10 }, scene);
  
  sphere.position.y = 1;
  
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);
  
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
        
        camera.position = camera.position.add(result);
      }
    }
  };
  
  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

addEventListener('resize', () => engine.resize());