import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CombatSystem } from '@/systems/CombatSystem';
import { Entity } from '@/core/Entity';
import { CombatComponent, CubeClusterComponent, DroppedCubeComponent, AbsorptionComponent } from '@/components';
import { getCombatConfig } from '@/config/config-loader';

describe('Core Mechanics - CombatSystem', () => {
  let combatSystem: CombatSystem;
  let playerEntity: Entity;
  let enemyEntity: Entity;

  beforeEach(() => {
    combatSystem = new CombatSystem();

    // Create player entity
    playerEntity = new Entity('player');
    playerEntity.addComponent(new CombatComponent(8, 8, 0, false));
    playerEntity.addComponent(new CubeClusterComponent(8, 1.0));
    playerEntity.addComponent(new AbsorptionComponent(0.0, 1.0));

    // Create enemy entity
    enemyEntity = new Entity('enemy');
    enemyEntity.addComponent(new CombatComponent(4, 4, 0, false));
    enemyEntity.addComponent(new CubeClusterComponent(4, 1.0));
  });

  afterEach(() => {
    if (combatSystem) {
      combatSystem.dispose();
    }
  });

  it('should calculate damage based on fast-fall collision', () => {
    const enemyCombat = enemyEntity.getComponent('CombatComponent') as CombatComponent;
    const initialDamage = enemyCombat.accumulatedDamage;

    // Fast-fall collision with enemy
    combatSystem.handleFastFallCollision(playerEntity, enemyEntity);

    // Damage formula: ceil(currentCubes / 8) = ceil(8/8) = 1
    // Damage is applied to target (enemy)
    expect(enemyCombat.accumulatedDamage).toBe(initialDamage + 1);
  });

  it('should trigger cube drop when damage reaches 1/8 threshold', () => {
    const combat = playerEntity.getComponent('CombatComponent') as CombatComponent;
    const cluster = playerEntity.getComponent('CubeClusterComponent') as CubeClusterComponent;

    // Accumulate damage to threshold (1/8 of 8 = 1)
    combat.accumulatedDamage = 1;

    const entities = [playerEntity];
    combatSystem.update(1/60, entities);

    // Should drop 1 cube
    expect(cluster.cubeCount).toBe(7);
    expect(combat.accumulatedDamage).toBe(0); // Reset after dropping
  });

  it('should trigger death when cubes below 12.5% of max', () => {
    const combat = playerEntity.getComponent('CombatComponent') as CombatComponent;
    const cluster = playerEntity.getComponent('CubeClusterComponent') as CubeClusterComponent;

    // Reduce cubes to 0 (below 12.5% of 8)
    cluster.cubeCount = 0;
    combat.health = 0;
    combat.accumulatedDamage = 1; // Trigger processing

    const entities = [playerEntity];
    combatSystem.update(1/60, entities);

    // Should be dead (cubes < 12.5% of max, and accumulated damage triggers check)
    expect(combat.isDead).toBe(true);
  });

  it('should add absorption buffer when collecting dropped cube', () => {
    const absorption = playerEntity.getComponent('AbsorptionComponent') as AbsorptionComponent;

    // Create dropped cube
    const droppedCube = new Entity('dropped_cube');
    droppedCube.addComponent(new DroppedCubeComponent(1, 10.0));

    combatSystem.collectDroppedCube(playerEntity, droppedCube);

    // Should add 0.5 to buffer (50% absorption rate)
    expect(absorption.buffer).toBe(0.5);
  });

  it('should add cube to cluster when buffer reaches 1.0', () => {
    const absorption = playerEntity.getComponent('AbsorptionComponent') as AbsorptionComponent;
    const cluster = playerEntity.getComponent('CubeClusterComponent') as CubeClusterComponent;
    const combat = playerEntity.getComponent('CombatComponent') as CombatComponent;

    absorption.buffer = 0.8;
    cluster.cubeCount = 7;
    combat.health = 7;
    combat.maxHealth = 8;

    // Collect cube that pushes buffer over 1.0
    const droppedCube = new Entity('dropped_cube');
    droppedCube.addComponent(new DroppedCubeComponent(1, 10.0));

    combatSystem.collectDroppedCube(playerEntity, droppedCube);

    // Buffer should be 0.3 (1.3 - 1.0) and cube added
    expect(absorption.buffer).toBeCloseTo(0.3, 5);
    expect(cluster.cubeCount).toBe(8);
    expect(combat.health).toBe(8);
  });

  it('should use config values for damage calculation', () => {
    const config = getCombatConfig();

    expect(config.absorptionRate).toBe(0.5);
    expect(config.cubeDropThreshold).toBe(0.125);
  });
});
