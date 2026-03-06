import * as THREE from 'three';

/**
 * LightingManager - Manages scene lighting and shadows
 *
 * Creates ambient light for base illumination and directional light for shadows
 */
export class LightingManager {
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create ambient light for base illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Create directional light as main light source
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(50, 100, 50);

    // Configure shadows
    this.directionalLight.castShadow = true;

    // Configure shadow camera bounds (covers game area)
    const shadowCamera = this.directionalLight.shadow.camera;
    shadowCamera.left = -100;
    shadowCamera.right = 100;
    shadowCamera.top = 100;
    shadowCamera.bottom = -100;
    shadowCamera.near = 0.5;
    shadowCamera.far = 500;

    // Set shadow map size for quality
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;

    // Use PCF soft shadows for better quality
    this.directionalLight.shadow.mapType = THREE.PCFSoftShadowMap;

    this.scene.add(this.directionalLight);
  }

  /**
   * Get the directional light (main light source)
   */
  getDirectionalLight(): THREE.DirectionalLight {
    return this.directionalLight;
  }

  /**
   * Get the ambient light
   */
  getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }

  /**
   * Dispose of lighting resources
   */
  dispose(): void {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    this.ambientLight.dispose();
    this.directionalLight.dispose();
  }
}
