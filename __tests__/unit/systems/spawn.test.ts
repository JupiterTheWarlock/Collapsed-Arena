import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { Entity } from '@/core/Entity';
import { SpawnComponent, CombatComponent, CubeClusterComponent, AIComponent, MovementComponent, PhysicsComponent } from '@/components';
import { getEnemyConfig } from '@/config/config-loader';

describe('Core Mechanics - SpawnSystem', () => {
  let spawnSystem: SpawnSystem;
  let playerEntity: Entity;

  beforeEach(() => {
    spawnSystem = new SpawnSystem();

    // Create player entity
    playerEntity = new Entity('player');
    playerEntity.addComponent(new CombatComponent(8, 8, 0, false));
    playerEntity.addComponent(new CubeClusterComponent(8, 1.0));
  });

  afterEach(() => {
    if (spawnSystem) {
      spawnSystem.dispose();
    }
  });

  it('should spawn enemy with base cube count on first wave', () => {
    spawnSystem.startSpawning();

    const entities = [playerEntity];

    // Manually trigger spawn by setting lastSpawnTime to 0
    const spawn = spawnSystem.getSpawnComponent() as SpawnComponent;
    spawn.lastSpawnTime = 0;

    spawnSystem.update(1/60, entities);

    // Should spawn enemy with baseCubes from config
    const enemies = entities.filter(e => e.getType() === 'enemy');
    expect(enemies.length).toBeGreaterThan(0);

    const enemy = enemies[0];
    const combat = enemy.getComponent('CombatComponent') as CombatComponent;
    expect(combat.health).toBe(getEnemyConfig().baseCubes);
  });

  it('should decrease spawn interval per wave', () => {
    const config = getEnemyConfig();
    const spawn = spawnSystem.getSpawnComponent() as SpawnComponent;

    spawnSystem.advanceWave();

    // Spawn interval should decrease
    expect(spawn.spawnInterval).toBeLessThan(config.baseSpawnInterval);
  });

  it('should increase enemy cube count per wave', () => {
    const config = getEnemyConfig();

    spawnSystem.advanceWave();
    spawnSystem.startSpawning();

    const entities = [playerEntity];

    // Manually trigger spawn
    const spawn = spawnSystem.getSpawnComponent() as SpawnComponent;
    spawn.lastSpawnTime = 0;

    spawnSystem.update(1/60, entities);

    const enemies = entities.filter(e => e.getType() === 'enemy');
    expect(enemies.length).toBeGreaterThan(0);

    const enemy = enemies[0];
    const combat = enemy.getComponent('CombatComponent') as CombatComponent;

    // Second wave should have more cubes (baseCubes + cubesPerWave)
    expect(combat.health).toBeGreaterThan(config.baseCubes);
  });

  it('should not spawn while cooling down', () => {
    const spawn = spawnSystem.getSpawnComponent() as SpawnComponent;
    spawn.lastSpawnTime = Date.now() / 1000;

    const entities = [playerEntity];
    const initialCount = entities.length;

    spawnSystem.update(1/60, entities);

    // Should not spawn immediately
    expect(entities.length).toBe(initialCount);
  });
});
