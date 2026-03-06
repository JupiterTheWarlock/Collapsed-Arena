import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { MaterialManager } from '@/rendering/MaterialManager';

describe('Rendering Layer - MaterialManager', () => {
  let materialManager: MaterialManager;

  beforeEach(() => {
    materialManager = new MaterialManager();
  });

  afterEach(() => {
    if (materialManager) {
      materialManager.dispose();
    }
  });

  it('should create a default cube material', () => {
    const material = materialManager.getCubeMaterial();

    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('should reuse cached cube material', () => {
    const material1 = materialManager.getCubeMaterial();
    const material2 = materialManager.getCubeMaterial();

    // Should return the same material instance (cached)
    expect(material1).toBe(material2);
  });

  it('should create a ground material', () => {
    const material = materialManager.getGroundMaterial();

    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('should reuse cached ground material', () => {
    const material1 = materialManager.getGroundMaterial();
    const material2 = materialManager.getGroundMaterial();

    // Should return the same material instance (cached)
    expect(material1).toBe(material2);
  });

  it('should create different materials for different types', () => {
    const cubeMaterial = materialManager.getCubeMaterial();
    const groundMaterial = materialManager.getGroundMaterial();

    // Should be different material instances
    expect(cubeMaterial).not.toBe(groundMaterial);
  });

  it('should dispose all cached materials', () => {
    // Create materials
    materialManager.getCubeMaterial();
    materialManager.getGroundMaterial();

    // Dispose should not throw
    expect(() => materialManager.dispose()).not.toThrow();
  });
});
