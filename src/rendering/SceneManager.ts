import * as THREE from 'three';
import { getCameraConfig } from '@/config/config-loader';

/**
 * SceneManager - Manages Three.js scene and renderer
 */
export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement;

  constructor() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Create camera
    const cameraConfig = getCameraConfig();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Create canvas
    this.canvas = document.createElement('canvas');

    // Try to create renderer (may fail in test environment)
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      // WebGL not available (test environment)
      console.warn('WebGL not available:', e);
    }
  }

  /**
   * Get the Three.js scene
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the Three.js camera
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the WebGL renderer (may be null in test environment)
   */
  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Set the renderer size
   */
  setSize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set the pixel ratio
   */
  setPixelRatio(pixelRatio: number): void {
    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
    }
  }

  /**
   * Render the scene
   */
  render(): void {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.scene.clear();
  }
}
