import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CollisionOptimizer } from '@/physics/CollisionOptimizer';
import { Entity } from '@/core/Entity';
import * as THREE from 'three';

describe('Physics - CollisionOptimizer', () => {
  let optimizer: CollisionOptimizer;

  beforeEach(() => {
    optimizer = new CollisionOptimizer(50);  // 50m culling distance
  });

  afterEach(() => {
    if (optimizer) {
      optimizer.dispose();
    }
  });

  it('should initialize with max culling distance', () => {
    expect(optimizer.getMaxCullingDistance()).toBe(50);
  });

  it('should cull entities beyond max distance', () => {
    const player = new Entity('player');
    player.setPosition(new THREE.Vector3(0, 0, 0));

    // Near entity (10m away)
    const nearEntity = new Entity('near');
    nearEntity.setPosition(new THREE.Vector3(10, 0, 0));

    // Far entity (100m away)
    const farEntity = new Entity('far');
    farEntity.setPosition(new THREE.Vector3(100, 0, 0));

    const entities = [player, nearEntity, farEntity];
    const visibleEntities = optimizer.getCullableEntities(player.getPosition(), entities);

    // Should only return player + near entity
    expect(visibleEntities.length).toBe(2);
    expect(visibleEntities).toContain(player);
    expect(visibleEntities).toContain(nearEntity);
    expect(visibleEntities).not.toContain(farEntity);
  });

  it('should include player in visible entities', () => {
    const player = new Entity('player');
    player.setPosition(new THREE.Vector3(0, 0, 0));

    const entities = [player];
    const visibleEntities = optimizer.getCullableEntities(player.getPosition(), entities);

    expect(visibleEntities).toContain(player);
  });

  it('should handle empty entity list', () => {
    const player = new Entity('player');
    player.setPosition(new THREE.Vector3(0, 0, 0));

    const entities: Entity[] = [];
    const visibleEntities = optimizer.getCullableEntities(player.getPosition(), entities);

    expect(visibleEntities.length).toBe(0);
  });

  it('should calculate distance correctly', () => {
    const pos1 = new THREE.Vector3(0, 0, 0);
    const pos2 = new THREE.Vector3(30, 0, 40);  // 50m away (3-4-5 triangle)

    const distance = optimizer.calculateDistance(pos1, pos2);

    expect(distance).toBeCloseTo(50, 1);  // Allow small floating point error
  });

  it('should set max culling distance', () => {
    optimizer.setMaxCullingDistance(100);
    expect(optimizer.getMaxCullingDistance()).toBe(100);
  });

  it('should filter entities by distance threshold', () => {
    const player = new Entity('player');
    player.setPosition(new THREE.Vector3(0, 0, 0));

    // Create entities at various distances
    const entities: Entity[] = [player];
    for (let i = 1; i <= 10; i++) {
      const entity = new Entity(`entity${i}`);
      entity.setPosition(new THREE.Vector3(i * 10, 0, 0));  // 10m, 20m, ... 100m
      entities.push(entity);
    }

    const visibleEntities = optimizer.getCullableEntities(player.getPosition(), entities);

    // Should include player + entities within 50m (0-50m)
    // That's player + entities at 10, 20, 30, 40, 50m
    expect(visibleEntities.length).toBe(6);  // player + 5 entities
  });

  it('should work with entities at negative positions', () => {
    const player = new Entity('player');
    player.setPosition(new THREE.Vector3(0, 0, 0));

    const entity1 = new Entity('neg1');
    entity1.setPosition(new THREE.Vector3(-30, 0, 0));  // 30m away

    const entity2 = new Entity('neg2');
    entity2.setPosition(new THREE.Vector3(-60, 0, 0));  // 60m away

    const entities = [player, entity1, entity2];
    const visibleEntities = optimizer.getCullableEntities(player.getPosition(), entities);

    expect(visibleEntities.length).toBe(2);
    expect(visibleEntities).toContain(entity1);
    expect(visibleEntities).not.toContain(entity2);
  });
});
