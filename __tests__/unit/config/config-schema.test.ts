import { describe, it, expect } from 'vitest';
import {
  getConfig,
  getPlayerConfig,
  getCombatConfig,
  getPyramidConfig,
  getEnemyConfig,
  getWorldConfig,
  getCameraConfig,
  getPerformanceConfig
} from '@/config/config-loader';

describe('Configuration System - Schema Validation', () => {
  it('should validate config has all required sections', () => {
    const requiredSections = [
      'player',
      'combat',
      'pyramid',
      'enemy',
      'world',
      'camera',
      'performance'
    ];

    const config = getConfig();

    // Check all required sections exist
    requiredSections.forEach(section => {
      expect(config).toHaveProperty(section);
    });
  });

  it('should validate player config structure', () => {
    const player = getPlayerConfig();

    expect(player).toHaveProperty('initialCubes');
    expect(player).toHaveProperty('rollSpeed');
    expect(player).toHaveProperty('jumpForce');
    expect(player).toHaveProperty('fastFallSpeed');
    expect(player).toHaveProperty('fastFallDamageMultiplier');

    expect(typeof player.initialCubes).toBe('number');
    expect(typeof player.rollSpeed).toBe('number');
    expect(typeof player.jumpForce).toBe('number');
    expect(typeof player.fastFallSpeed).toBe('number');
    expect(typeof player.fastFallDamageMultiplier).toBe('number');

    // Verify values match design document
    expect(player.initialCubes).toBe(8);
    expect(player.rollSpeed).toBe(10);
    expect(player.jumpForce).toBe(15);
    expect(player.fastFallSpeed).toBe(30);
    expect(player.fastFallDamageMultiplier).toBe(1.0);
  });

  it('should validate combat config structure', () => {
    const combat = getCombatConfig();

    expect(combat).toHaveProperty('absorptionRate');
    expect(combat).toHaveProperty('cubeDropThreshold');
    expect(combat).toHaveProperty('healthPerCube');
    expect(combat).toHaveProperty('attackPerCubes');
    expect(combat).toHaveProperty('deathThreshold');

    expect(typeof combat.absorptionRate).toBe('number');
    expect(typeof combat.cubeDropThreshold).toBe('number');
    expect(typeof combat.healthPerCube).toBe('number');
    expect(typeof combat.attackPerCubes).toBe('number');
    expect(typeof combat.deathThreshold).toBe('number');

    // Verify values match design document
    expect(combat.absorptionRate).toBe(0.5);
    expect(combat.cubeDropThreshold).toBe(0.125);
    expect(combat.healthPerCube).toBe(1);
    expect(combat.attackPerCubes).toBe(8);
    expect(combat.deathThreshold).toBe(0.125);
  });

  it('should validate pyramid config structure', () => {
    const pyramid = getPyramidConfig();

    expect(pyramid).toHaveProperty('sizeRatio');
    expect(pyramid).toHaveProperty('slowDuration');
    expect(pyramid).toHaveProperty('slowFactor');
    expect(pyramid).toHaveProperty('projectileSpeed');

    expect(typeof pyramid.sizeRatio).toBe('number');
    expect(typeof pyramid.slowDuration).toBe('number');
    expect(typeof pyramid.slowFactor).toBe('number');
    expect(typeof pyramid.projectileSpeed).toBe('number');

    // Verify values match design document
    expect(pyramid.sizeRatio).toBe(0.125);
    expect(pyramid.slowDuration).toBe(3.0);
    expect(pyramid.slowFactor).toBe(0.5);
    expect(pyramid.projectileSpeed).toBe(20);
  });

  it('should validate enemy config has AI subsection', () => {
    const enemy = getEnemyConfig();

    expect(enemy).toHaveProperty('ai');
    expect(typeof enemy.ai).toBe('object');

    expect(enemy.ai).toHaveProperty('trackingSpeedMultiplier');
    expect(enemy.ai).toHaveProperty('jumpTriggerDistance');
    expect(enemy.ai).toHaveProperty('fastFallTriggerTime');
    expect(enemy.ai).toHaveProperty('attackCooldown');

    // Verify values match design document
    expect(enemy.baseSpawnInterval).toBe(8.0);
    expect(enemy.minSpawnInterval).toBe(2.0);
    expect(enemy.baseCubes).toBe(4);
    expect(enemy.cubesPerWave).toBe(2);
    expect(enemy.difficultyBalanceRange).toBe(0.3);
  });

  it('should validate performance config has subsections', () => {
    const performance = getPerformanceConfig();

    expect(performance).toHaveProperty('droppedCubes');
    expect(performance).toHaveProperty('collision');

    expect(performance.droppedCubes).toHaveProperty('maxCount');
    expect(performance.droppedCubes).toHaveProperty('lifetimeSeconds');

    expect(performance.collision).toHaveProperty('spatialPartitionGridSize');
    expect(performance.collision).toHaveProperty('playerDetectionRange');

    // Verify values match design document (CRITICAL for performance)
    expect(performance.droppedCubes.maxCount).toBe(200);
    expect(performance.droppedCubes.lifetimeSeconds).toBe(10.0);
    expect(performance.collision.spatialPartitionGridSize).toBe(10);
    expect(performance.collision.playerDetectionRange).toBe(50);
  });

  it('should validate camera config structure', () => {
    const camera = getCameraConfig();

    expect(camera).toHaveProperty('followType');
    expect(camera).toHaveProperty('distance');
    expect(camera).toHaveProperty('height');
    expect(camera).toHaveProperty('angle');
    expect(camera).toHaveProperty('smoothFactor');

    // Verify values match design document
    expect(camera.followType).toBe('thirdPersonFixed');
    expect(camera.distance).toBe(15);
    expect(camera.height).toBe(8);
    expect(camera.angle).toBe(30);
    expect(camera.smoothFactor).toBe(0.1);
  });

  it('should validate world config structure', () => {
    const world = getWorldConfig();

    expect(world).toHaveProperty('mapType');
    expect(world).toHaveProperty('mapSize');

    // Verify values match design document
    expect(world.mapType).toBe('flat');
    expect(world.mapSize).toBe('infinite');
  });
});
