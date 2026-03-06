import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DifficultySystem } from '@/systems/DifficultySystem';
import { Entity } from '@/core/Entity';
import { CombatComponent } from '@/components';
import { getEnemyConfig } from '@/config/config-loader';

describe('Core Mechanics - DifficultySystem', () => {
  let difficultySystem: DifficultySystem;
  let playerEntity: Entity;

  beforeEach(() => {
    difficultySystem = new DifficultySystem();

    // Create player entity
    playerEntity = new Entity('player');
    playerEntity.addComponent(new CombatComponent(8, 8, 0, false));
  });

  afterEach(() => {
    if (difficultySystem) {
      difficultySystem.dispose();
    }
  });

  it('should initialize with base difficulty multiplier of 1.0', () => {
    expect(difficultySystem.getDifficultyMultiplier()).toBeCloseTo(1.0, 5);
  });

  it('should track kill count over time', () => {
    const config = getEnemyConfig();

    // Simulate 3 kills
    for (let i = 0; i < 3; i++) {
      difficultySystem.recordKill();
    }

    expect(difficultySystem.getRecentKillCount()).toBe(3);
  });

  it('should increase difficulty multiplier when kill rate is high', () => {
    const config = getEnemyConfig();

    // Simulate 10 kills in 5 seconds (high kill rate)
    for (let i = 0; i < 10; i++) {
      difficultySystem.recordKill();
    }

    // Advance time by 5 seconds
    const entities = [playerEntity];
    difficultySystem.update(5, entities);

    // Difficulty should increase (up to +30%)
    const multiplier = difficultySystem.getDifficultyMultiplier();
    expect(multiplier).toBeGreaterThan(1.0);
    expect(multiplier).toBeLessThanOrEqual(1.0 + config.difficultyBalanceRange);
  });

  it('should decrease difficulty multiplier when kill rate is low', () => {
    const config = getEnemyConfig();

    // Record one kill
    difficultySystem.recordKill();

    // Advance time by 30 seconds with no kills (low kill rate)
    const entities = [playerEntity];
    for (let i = 0; i < 30; i++) {
      difficultySystem.update(1, entities);
    }

    // Difficulty should decrease (down to -30%)
    const multiplier = difficultySystem.getDifficultyMultiplier();
    expect(multiplier).toBeLessThan(1.0);
    expect(multiplier).toBeGreaterThanOrEqual(1.0 - config.difficultyBalanceRange);
  });

  it('should clamp difficulty multiplier within ±30% range', () => {
    const config = getEnemyConfig();
    const entities = [playerEntity];

    // Try to increase difficulty massively
    for (let i = 0; i < 100; i++) {
      difficultySystem.recordKill();
      difficultySystem.update(0.1, entities);
    }

    const maxMultiplier = 1.0 + config.difficultyBalanceRange;
    expect(difficultySystem.getDifficultyMultiplier()).toBeCloseTo(maxMultiplier, 5);

    // Reset and try to decrease
    difficultySystem.dispose();
    const difficultySystem2 = new DifficultySystem();

    // Advance time with no kills
    for (let i = 0; i < 100; i++) {
      difficultySystem2.update(1, [playerEntity]);
    }

    const minMultiplier = 1.0 - config.difficultyBalanceRange;
    expect(difficultySystem2.getDifficultyMultiplier()).toBeCloseTo(minMultiplier, 5);
    difficultySystem2.dispose();
  });

  it('should use config values for balance range', () => {
    const config = getEnemyConfig();
    expect(config.difficultyBalanceRange).toBe(0.3);
  });

  it('should reset kill history after tracking window', () => {
    // Record some kills
    for (let i = 0; i < 5; i++) {
      difficultySystem.recordKill();
    }

    expect(difficultySystem.getRecentKillCount()).toBe(5);

    // Advance time beyond tracking window (30 seconds)
    const entities = [playerEntity];
    for (let i = 0; i < 31; i++) {
      difficultySystem.update(1, entities);
    }

    // Old kills should be cleared
    expect(difficultySystem.getRecentKillCount()).toBe(0);
  });

  it('should calculate adjusted spawn interval based on difficulty', () => {
    const baseInterval = 8.0;

    // Increase difficulty
    for (let i = 0; i < 10; i++) {
      difficultySystem.recordKill();
    }
    difficultySystem.update(5, [playerEntity]);

    const adjustedInterval = difficultySystem.getAdjustedSpawnInterval(baseInterval);

    // Higher difficulty = lower interval (faster spawns)
    expect(adjustedInterval).toBeLessThan(baseInterval);
  });
});
