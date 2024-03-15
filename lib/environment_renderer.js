class EnvironmentRenderer {
  #scene;
  #playerPos = new WorldPosDim();
  #skyboxMesh;
  
  constructor(playerPos, scene) {
    this.#scene = scene;
    this.#playerPos.copyFrom(playerPos);
    this.#createLight();
    this.#createSkybox();
  }
  
  #createLight() {
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.#scene);
    light.intensity = 0.7;
  }
  
  #removeSkybox() {
    if (this.#skyboxMesh != null) {
      this.#skyboxMesh.dispose();
      this.#skyboxMesh = null;
    }
  }
  
  #createSkybox() {
    // https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox
    this.#skyboxMesh = scene.createDefaultSkybox(skyboxTexture, false, 1000);
  }
  
  updatePlayerPos(playerPos) {
    if (playerPos.getDimension() != this.#playerPos.getDimension()) {
      this.#removeSkybox();
      this.#createSkybox();
      this.#playerPos.copyFrom(playerPos);
    }
  }
}
