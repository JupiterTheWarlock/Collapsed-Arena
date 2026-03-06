import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AISystem } from '@/systems/AISystem';
import { Entity } from '@/core/Entity';
import { AIComponent, MovementComponent, PhysicsComponent, PlayerControlComponent, CombatComponent, CubeClusterComponent } from '@/components';
import * as THREE from 'three';
import { getEnemyConfig } from '@/config/config-loader';

describe('Core Mechanics - AISystem', () => {
  let aiSystem: AISystem;
  let enemyEntity: Entity;
  let playerEntity: Entity;

  beforeEach(() => {
    aiSystem = new AISystem();

    // Create enemy entity
    enemyEntity = new Entity('enemy');
    enemyEntity.addComponent(new AIComponent(0.8, 20, 0.3, 2.0, 0));
    enemyEntity.addComponent(new MovementComponent(10, 15, 30, true));
    enemyEntity.addComponent(new PhysicsComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    enemyEntity.addComponent(new CombatComponent(4, 4, 0, false));
    enemyEntity.addComponent(new CubeClusterComponent(4, 1.0));

    // Create player entity
    playerEntity = new Entity('player');
    playerEntity.setPosition({ x: 10, y: 0, z: 10 });
    playerEntity.addComponent(new PlayerControlComponent(0));
  });

  afterEach(() => {
    if (aiSystem) {
      aiSystem.dispose();
    }
  });

  it('should spawn enemy with config cube count', () => {
    const combat = enemyEntity.getComponent('CombatComponent') as CombatComponent;
    const cluster = enemyEntity.getComponent('CubeClusterComponent') as CubeClusterComponent;

    expect(cluster.cubeCount).toBe(4);
    expect(combat.health).toBe(4);
  });

  it('should track player position', () => {
    const physics = enemyEntity.getComponent('PhysicsComponent') as PhysicsComponent;
    const ai = enemyEntity.getComponent('AIComponent') as AIComponent;

    // Set player position
    playerEntity.setPosition({ x: 10, y: 0, z: 10 });

    const entities = [playerEntity, enemyEntity];
    aiSystem.update(1/60, entities);

    // Enemy should move toward player
    expect(physics.velocity.z).toBeGreaterThan(0);
  });

  it('should jump when in range of player', () => {
    const physics = enemyEntity.getComponent('PhysicsComponent') as PhysicsComponent;
    const movement = enemyEntity.getComponent('MovementComponent') as MovementComponent;

    // Position enemy close to player
    playerEntity.setPosition({ x: 15, y: 0, z: 15 });
    enemyEntity.setPosition({ x: 5, y: 0, z: 5 });

    const entities = [playerEntity, enemyEntity];
    aiSystem.update(1/60, entities);

    // Should have jumped (upward velocity)
    expect(physics.velocity.y).toBeGreaterThan(0);
  });

  it('should use config values for AI behavior', () => {
    const config = getEnemyConfig();

    expect(config.ai.trackingSpeedMultiplier).toBe(0.8);
    expect(config.ai.jumpTriggerDistance).toBe(20);
  });

  it('should respect attack cooldown', () => {
    const ai = enemyEntity.getComponent('AIComponent') as AIComponent;

    // Set last attack time to now
    ai.lastAttackTime = Date.now() / 1000;

    const entities = [playerEntity, enemyEntity];
    aiSystem.update(1/60, entities);

    // Should not attack due to cooldown
    const canAttack = aiSystem.canAttack(enemyEntity);
    expect(canAttack).toBe(false);
  });
});
