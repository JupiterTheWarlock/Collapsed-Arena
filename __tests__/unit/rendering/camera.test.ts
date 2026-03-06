import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '@/rendering/CameraController';
import { getCameraConfig } from '@/config/config-loader';

describe('Rendering Layer - CameraController', () => {
  let cameraController: CameraController;
  let mockCamera: THREE.PerspectiveCamera;
  let mockTarget: THREE.Object3D;

  beforeEach(() => {
    // Create camera
    mockCamera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);

    // Create target object to follow
    mockTarget = new THREE.Object3D();
    mockTarget.position.set(0, 0, 0);

    // Get camera config
    const cameraConfig = getCameraConfig();

    // Create CameraController
    cameraController = new CameraController(mockCamera, cameraConfig);
  });

  afterEach(() => {
    if (cameraController) {
      cameraController.dispose();
    }
  });

  it('should initialize camera at configured distance and height from target', () => {
    // Update camera to follow target
    cameraController.update(1/60, mockTarget);

    // Camera should be at configured distance (15) and height (8)
    const cameraPos = mockCamera.position;
    const distance = Math.sqrt(cameraPos.x ** 2 + cameraPos.z ** 2);
    const height = cameraPos.y;

    expect(distance).toBeCloseTo(15, 1);
    expect(height).toBeCloseTo(8, 1);
  });

  it('should smoothly follow target position with interpolation', () => {
    // Move target to new position
    mockTarget.position.set(10, 0, 10);

    // Update camera
    cameraController.update(1/60, mockTarget);

    // Camera should move toward target (with smoothing)
    const cameraPos = mockCamera.position;
    const distanceToTarget = Math.sqrt(
      (cameraPos.x - 10) ** 2 +
      (cameraPos.z - 10) ** 2
    );

    // Camera should be at configured distance from target
    expect(distanceToTarget).toBeCloseTo(15, 1);
  });

  it('should maintain configured angle relative to target', () => {
    mockTarget.position.set(5, 0, 5);

    cameraController.update(1/60, mockTarget);

    // Camera should be at configured angle (30 degrees) relative to target
    const cameraPos = mockCamera.position;
    const relativeX = cameraPos.x - mockTarget.position.x;
    const relativeZ = cameraPos.z - mockTarget.position.z;
    const angle = Math.atan2(relativeX, relativeZ) * (180 / Math.PI);

    expect(angle).toBeCloseTo(30, 1);
  });

  it('should use smoothFactor from config for interpolation', () => {
    const smoothFactor = getCameraConfig().smoothFactor;

    // First, position camera at origin with target
    mockTarget.position.set(0, 0, 0);
    cameraController.update(1/60, mockTarget);

    // Now move target far away
    mockTarget.position.set(50, 0, 50);

    // Get initial camera position
    const initialPos = mockCamera.position.clone();

    // Update once - should use smooth interpolation
    cameraController.update(1/60, mockTarget);

    // Camera should move with smooth interpolation (not instantly)
    const moved = initialPos.distanceTo(mockCamera.position);

    // Should have moved some amount but not all the way instantly
    expect(moved).toBeGreaterThan(0);
    expect(moved).toBeLessThan(70);
  });

  it('should look at target position', () => {
    mockTarget.position.set(5, 2, 5);

    cameraController.update(1/60, mockTarget);

    // After lookAt, the camera's direction vector should point toward target
    const cameraDirection = new THREE.Vector3();
    mockCamera.getWorldDirection(cameraDirection);

    // Calculate expected direction (from camera to target)
    const expectedDirection = mockTarget.position.clone()
      .sub(mockCamera.position)
      .normalize();

    expect(cameraDirection.x).toBeCloseTo(expectedDirection.x, 1);
    expect(cameraDirection.y).toBeCloseTo(expectedDirection.y, 1);
    expect(cameraDirection.z).toBeCloseTo(expectedDirection.z, 1);
  });
});
