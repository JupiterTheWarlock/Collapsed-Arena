import * as THREE from 'three';

/**
 * MaterialManager - Caches and reuses materials
 *
 * Creates MeshStandardMaterial for game objects with consistent appearance
 */
export class MaterialManager {
  private cubeMaterial: THREE.MeshStandardMaterial | null = null;
  private groundMaterial: THREE.MeshStandardMaterial | null = null;

  constructor() {
    // Materials created on demand
  }

  /**
   * Get the cube material (cached)
   */
  getCubeMaterial(): THREE.MeshStandardMaterial {
    if (!this.cubeMaterial) {
      this.cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        roughness: 0.7,
        metalness: 0.3
      });
    }
    return this.cubeMaterial;
  }

  /**
   * Get the ground material (cached)
   */
  getGroundMaterial(): THREE.MeshStandardMaterial {
    if (!this.groundMaterial) {
      this.groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1
      });
    }
    return this.groundMaterial;
  }

  /**
   * Dispose all cached materials
   */
  dispose(): void {
    if (this.cubeMaterial) {
      this.cubeMaterial.dispose();
      this.cubeMaterial = null;
    }
    if (this.groundMaterial) {
      this.groundMaterial.dispose();
      this.groundMaterial = null;
    }
  }
}
