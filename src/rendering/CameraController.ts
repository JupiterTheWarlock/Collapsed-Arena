import * as THREE from 'three';
import type { CameraConfig } from '@/config/config-loader';

/**
 * CameraController - Third-person game camera
 *
 * Follows target with smooth interpolation. Supports independent yaw (player direction)
 * and pitch (camera vertical angle) for third-person game controls.
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
   * @param yaw - Player's movement direction (horizontal, in radians)
   * @param pitch - Camera's vertical angle (in radians, optional)
   */
  update(deltaTime: number, target: THREE.Object3D, yaw: number, pitch: number = 0): void {
    const targetPos = target.position;

    // Calculate camera position relative to target
    // Camera is behind the player, offset by yaw angle
    const behindAngle = yaw + Math.PI; // Behind the player

    // Calculate base position (behind player at configured distance)
    const baseX = targetPos.x + Math.sin(behindAngle) * this.config.distance;
    const baseZ = targetPos.z + Math.cos(behindAngle) * this.config.distance;
    const baseY = targetPos.y + this.config.height;

    // Apply pitch (vertical rotation)
    // Pitch lifts the camera up and moves it forward/backward
    const pitchOffset = Math.sin(pitch) * this.config.distance * 0.5;
    const finalY = baseY + pitchOffset;
    const finalX = baseX - Math.sin(yaw) * pitchOffset * 0.3;
    const finalZ = baseZ - Math.cos(yaw) * pitchOffset * 0.3;

    const desiredPosition = new THREE.Vector3(finalX, finalY, finalZ);

    // Look at point (slightly above player's feet)
    const lookAtY = targetPos.y + 1.0; // Look slightly above ground
    const desiredLookAt = new THREE.Vector3(targetPos.x, lookAtY, targetPos.z);

    // Check if this is the first update (camera still at origin)
    const isFirstUpdate = this.currentPosition.lengthSq() === 0;

    if (isFirstUpdate) {
      // On first update, set position directly
      this.currentPosition.copy(desiredPosition);
      this.currentLookAt.copy(desiredLookAt);
    } else {
      // Smooth interpolation using smoothFactor
      this.currentPosition.lerp(desiredPosition, this.config.smoothFactor);
      this.currentLookAt.lerp(desiredLookAt, this.config.smoothFactor);
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
