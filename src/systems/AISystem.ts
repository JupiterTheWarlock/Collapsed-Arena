import * as THREE from 'three';
import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { AIComponent, MovementComponent, PhysicsComponent, PlayerControlComponent } from '@/components';
import { getEnemyConfig } from '@/config/config-loader';

/**
 * AISystem - Controls enemy AI behavior
 *
 * Implements tracking, jumping, and fast-fall attacks
 */
export class AISystem extends System {
  constructor() {
    super('AISystem');
  }

  /**
   * Update AI for all enemy entities
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    const config = getEnemyConfig();

    // Find player
    const player = entities.find(e => e.getType() === 'player');
    if (!player) return;

    const playerPos = player.getPosition();

    // Process each enemy
    for (const entity of entities) {
      if (!entity.isActive() || entity.getType() !== 'enemy') continue;

      const ai = entity.getComponent('AIComponent') as AIComponent;
      const physics = entity.getComponent('PhysicsComponent') as PhysicsComponent;
      const movement = entity.getComponent('MovementComponent') as MovementComponent;

      if (!ai || !physics || !movement) continue;

      // Track player
      this.trackPlayer(entity, playerPos, physics, ai, deltaTime);

      // Jump when in range
      const distanceToPlayer = entity.getPosition().distanceTo(playerPos);
      if (distanceToPlayer < ai.jumpTriggerDistance && movement.isGrounded) {
        this.performJump(movement, physics, ai);
      }

      // Fast-fall when airborne above player
      const playerY = playerPos.y;
      if (!movement.isGrounded && entity.getPosition().y > playerY + 2) {
        this.performFastFall(movement, physics, ai);
      }
    }
  }

  /**
   * Track player position
   */
  private trackPlayer(
    entity: Entity,
    playerPos: any,
    physics: PhysicsComponent,
    ai: AIComponent,
    deltaTime: number
  ): void {
    const enemyPos = entity.getPosition();
    const playerVec = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);
    const enemyVec = new THREE.Vector3(enemyPos.x, enemyPos.y, enemyPos.z);

    const direction = new THREE.Vector3()
      .subVectors(playerVec, enemyVec)
      .normalize();

    // Apply tracking speed
    const speed = 10 * ai.trackingSpeedMultiplier;
    physics.velocity.x += direction.x * speed * deltaTime;
    physics.velocity.z += direction.z * speed * deltaTime;
  }

  /**
   * Perform jump
   */
  private performJump(movement: MovementComponent, physics: PhysicsComponent, ai: AIComponent): void {
    physics.velocity.y = movement.jumpForce;
    movement.isGrounded = false;
  }

  /**
   * Perform fast-fall
   */
  private performFastFall(movement: MovementComponent, physics: PhysicsComponent, ai: AIComponent): void {
    physics.velocity.y = -movement.fastFallSpeed;
  }

  /**
   * Check if entity can attack
   */
  canAttack(entity: Entity): boolean {
    const ai = entity.getComponent('AIComponent') as AIComponent;
    if (!ai) return false;

    const currentTime = Date.now() / 1000;
    return currentTime - ai.lastAttackTime >= ai.attackCooldown;
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    // Nothing to dispose
  }
}
