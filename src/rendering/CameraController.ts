import * as THREE from 'three';
import type { CameraConfig } from '@/config/config-loader';

/**
 * CameraController - Third-person fixed follow camera
 *
 * Follows target with smooth interpolation at configured distance/height/angle
 */
export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private config: CameraConfig;
  private currentPosition: THREE.Vector3;
  private currentLookAt: THREE.Vector3;

  constructor(camera: THREE.PerspectiveCamera, config: CameraConfig) {
    this.camera = camera;
    this.config = config;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }

  /**
   * Update camera position to follow target
   * @param deltaTime - Time since last frame (in seconds)
   * @param target - Object to follow
   */
  update(deltaTime: number, target: THREE.Object3D): void {
    // Calculate desired camera position based on config
    const targetPos = target.position;

    // Convert angle from degrees to radians
    const angleRad = this.config.angle * (Math.PI / 180);

    // Calculate camera position relative to target
    const desiredX = targetPos.x + Math.sin(angleRad) * this.config.distance;
    const desiredZ = targetPos.z + Math.cos(angleRad) * this.config.distance;
    const desiredY = targetPos.y + this.config.height;

    const desiredPosition = new THREE.Vector3(desiredX, desiredY, desiredZ);

    // Check if this is the first update (camera still at origin)
    const isFirstUpdate = this.currentPosition.lengthSq() === 0;

    if (isFirstUpdate) {
      // On first update, set position directly
      this.currentPosition.copy(desiredPosition);
      this.currentLookAt.copy(targetPos);
    } else {
      // Smooth interpolation using smoothFactor
      this.currentPosition.lerp(desiredPosition, this.config.smoothFactor);
      this.currentLookAt.lerp(targetPos, this.config.smoothFactor);
    }

    // Update camera position
    this.camera.position.copy(this.currentPosition);

    // Make camera look at target
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    // Nothing to dispose for camera controller
  }
}
