// Game configuration
// Source: docs/game-design.md Section 9
export const gameConfig = {
  player: {
    initialCubes: 1,
    rollSpeed: 6.28, // 2π - rolls 2 times per second (circumference = π per roll) - DEPRECATED, now dynamic
    jumpForce: 15,
    fastFallSpeed: 30,
    fastFallDamageMultiplier: 1.0
  },
  combat: {
    absorptionRate: 0.5,
    cubeDropThreshold: 0.125,
    healthPerCube: 1,
    attackPerCubes: 8,
    deathThreshold: 0.125
  },
  pyramid: {
    sizeRatio: 0.125,
    slowDuration: 3.0,
    slowFactor: 0.5,
    projectileSpeed: 20
  },
  enemy: {
    baseSpawnInterval: 8.0,
    minSpawnInterval: 2.0,
    baseCubes: 4,
    cubesPerWave: 2,
    difficultyBalanceRange: 0.3,
    ai: {
      trackingSpeedMultiplier: 0.8,
      jumpTriggerDistance: 20,
      fastFallTriggerTime: 0.3,
      attackCooldown: 2.0
    }
  },
  world: {
    mapType: 'flat',
    mapSize: 'infinite'
  },
  camera: {
    followType: 'thirdPersonFixed',
    distance: 15,
    height: 8,
    angle: 30,
    smoothFactor: 0.1
  },
  performance: {
    droppedCubes: {
      maxCount: 200,
      lifetimeSeconds: 10.0
    },
    collision: {
      spatialPartitionGridSize: 10,
      playerDetectionRange: 50
    }
  }
} as const;

// Type definitions
export type GameConfig = typeof gameConfig;
export type PlayerConfig = typeof gameConfig.player;
export type CombatConfig = typeof gameConfig.combat;
export type PyramidConfig = typeof gameConfig.pyramid;
export type EnemyConfig = typeof gameConfig.enemy;
export type WorldConfig = typeof gameConfig.world;
export type CameraConfig = typeof gameConfig.camera;
export type PerformanceConfig = typeof gameConfig.performance;

// Singleton instance
let configInstance: GameConfig | null = null;

export function loadConfig(): GameConfig {
  if (configInstance) {
    return configInstance;
  }

  configInstance = gameConfig;
  return configInstance;
}

export function getConfig(): GameConfig {
  if (!configInstance) {
    loadConfig();
  }
  return configInstance;
}

export function getPlayerConfig(): PlayerConfig {
  return getConfig().player;
}

export function getCombatConfig(): CombatConfig {
  return getConfig().combat;
}

export function getPyramidConfig(): PyramidConfig {
  return getConfig().pyramid;
}

export function getEnemyConfig(): EnemyConfig {
  return getConfig().enemy;
}

export function getWorldConfig(): WorldConfig {
  return getConfig().world;
}

export function getCameraConfig(): CameraConfig {
  return getConfig().camera;
}

export function getPerformanceConfig(): PerformanceConfig {
  return getConfig().performance;
}
