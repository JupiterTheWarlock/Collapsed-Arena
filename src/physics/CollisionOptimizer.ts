import { Entity } from '@/core/Entity';
import * as THREE from 'three';

/**
 * CollisionOptimizer - Distance culling for performance
 *
 * Filters entities by distance to reduce collision checks
 */
export class CollisionOptimizer {
  private maxCullingDistance: number;

  constructor(maxCullingDistance: number = 50) {
    this.maxCullingDistance = maxCullingDistance;
  }

  /**
   * Get entities within culling distance
   * @param referencePosition - Reference position (e.g., player)
   * @param entities - All entities to filter
   * @returns Entities within max distance
   */
  getCullableEntities(referencePosition: any, entities: Entity[]): Entity[] {
    return entities.filter(entity => {
      const entityPos = entity.getPosition();
      const distance = this.calculateDistance(referencePosition, entityPos);

      return distance <= this.maxCullingDistance;
    });
  }

  /**
   * Calculate distance between two positions
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Distance in meters
   */
  calculateDistance(pos1: any, pos2: any): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get max culling distance
   * @returns Max distance in meters
   */
  getMaxCullingDistance(): number {
    return this.maxCullingDistance;
  }

  /**
   * Set max culling distance
   * @param distance - Max distance in meters
   */
  setMaxCullingDistance(distance: number): void {
    this.maxCullingDistance = distance;
  }

  /**
   * Dispose of optimizer
   */
  dispose(): void {
    // Nothing to dispose
  }
}
