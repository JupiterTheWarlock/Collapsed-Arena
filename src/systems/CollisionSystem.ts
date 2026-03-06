import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { PhysicsComponent, MovementComponent, CombatComponent } from '@/components';
import { SpatialPartition } from '@/physics/SpatialPartition';
import { CollisionOptimizer } from '@/physics/CollisionOptimizer';
import { getPerformanceConfig } from '@/config/config-loader';
import * as THREE from 'three';

/**
 * CollisionSystem - Handles entity collision detection
 *
 * Implements three-phase collision detection:
 * 1. Distance culling (50m range)
 * 2. Spatial partitioning (10m grid)
 * 3. Precise collision check (1.0m threshold)
 */
export class CollisionSystem extends System {
  private spatialPartition: SpatialPartition;
  private collisionOptimizer: CollisionOptimizer;
  private combatSystemRef: any; // Reference to CombatSystem

  constructor(combatSystem: any) {
    super('CollisionSystem');

    const perfConfig = getPerformanceConfig();
    this.spatialPartition = new SpatialPartition(
      perfConfig.collision.spatialPartitionGridSize
    );
    this.collisionOptimizer = new CollisionOptimizer(
      perfConfig.collision.playerDetectionRange
    );
    this.combatSystemRef = combatSystem;
  }

  /**
   * Update collision detection for all entities
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    // Update spatial partition
    this.updateSpatialPartition(entities);

    // Get player entity for reference position
    const player = entities.find(e => e.getType() === 'player');
    if (!player) return;

    // Phase 1: Distance culling
    const nearbyEntities = this.collisionOptimizer.getCullableEntities(
      player.getPosition(),
      entities
    );

    // Phase 2 & 3: Spatial partition + precise collision
    this.checkCollisions(nearbyEntities);
  }

  /**
   * Update spatial partition with all entities
   */
  private updateSpatialPartition(entities: Entity[]): void {
    // Clear existing partition
    this.spatialPartition.clear();

    // Add all active entities
    for (const entity of entities) {
      if (!entity.isActive()) continue;
      this.spatialPartition.addEntity(entity);
    }
  }

  /**
   * Check collisions between entities using spatial partition
   */
  private checkCollisions(entities: Entity[]): void {
    for (const entityA of entities) {
      if (!entityA.isActive()) continue;

      const physicsA = entityA.getComponent('PhysicsComponent') as PhysicsComponent;
      const movementA = entityA.getComponent('MovementComponent') as MovementComponent;
      const combatA = entityA.getComponent('CombatComponent') as CombatComponent;

      if (!physicsA) continue;

      // Get nearby entities from spatial partition
      const nearbyEntities = this.spatialPartition.getNearbyEntities(
        new THREE.Vector3(entityA.getPosition().x, entityA.getPosition().y, entityA.getPosition().z)
      );

      for (const entityB of nearbyEntities) {
        if (entityA === entityB || !entityB.isActive()) continue;

        const physicsB = entityB.getComponent('PhysicsComponent') as PhysicsComponent;
        if (!physicsB) continue;

        // Calculate distance
        const posA = entityA.getPosition();
        const posB = entityB.getPosition();
        const distance = Math.sqrt(
          Math.pow(posA.x - posB.x, 2) +
          Math.pow(posA.y - posB.y, 2) +
          Math.pow(posA.z - posB.z, 2)
        );

        // Collision threshold (1.0m = box size)
        const COLLISION_THRESHOLD = 1.0;

        if (distance < COLLISION_THRESHOLD) {
          // Check if this is a fast-fall attack
          if (movementA && !movementA.isGrounded && combatA) {
            // Check if entity is fast-falling (high downward velocity)
            const fastFallThreshold = -20; // Configured threshold
            if (physicsA.velocity.y < fastFallThreshold) {
              // Handle fast-fall collision damage
              this.combatSystemRef.handleFastFallCollision(entityA, entityB);
            }
          }

          // Simple physics collision response
          this.handlePhysicalCollision(entityA, entityB);
        }
      }
    }
  }

  /**
   * Handle physical collision response
   */
  private handlePhysicalCollision(entityA: Entity, entityB: Entity): void {
    const physicsA = entityA.getComponent('PhysicsComponent') as PhysicsComponent;
    const physicsB = entityB.getComponent('PhysicsComponent') as PhysicsComponent;

    if (!physicsA || !physicsB) return;

    // Calculate collision normal
    const posA = entityA.getPosition();
    const posB = entityB.getPosition();
    const normal = {
      x: posA.x - posB.x,
      y: posA.y - posB.y,
      z: posA.z - posB.z
    };

    // Normalize
    const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    // Separate entities to prevent overlap
    const separationForce = 0.5;
    physicsA.velocity.x += normal.x * separationForce;
    physicsA.velocity.y += normal.y * separationForce;
    physicsA.velocity.z += normal.z * separationForce;
    physicsB.velocity.x -= normal.x * separationForce;
    physicsB.velocity.y -= normal.y * separationForce;
    physicsB.velocity.z -= normal.z * separationForce;
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    this.spatialPartition.dispose();
    this.collisionOptimizer.dispose();
  }
}
