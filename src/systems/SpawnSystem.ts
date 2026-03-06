import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { SpawnComponent, CombatComponent, CubeClusterComponent, AIComponent, MovementComponent, PhysicsComponent } from '@/components';
import { getEnemyConfig } from '@/config/config-loader';

/**
 * SpawnSystem - Manages enemy spawning
 *
 * Handles wave-based spawning with dynamic difficulty
 */
export class SpawnSystem extends System {
  private spawnComponent: SpawnComponent;
  private isSpawning: boolean = false;
  private entityManager: any; // Will be set externally

  constructor() {
    super('SpawnSystem');

    const config = getEnemyConfig();
    this.spawnComponent = new SpawnComponent(
      0,
      config.baseSpawnInterval,
      0,
      1
    );
  }

  /**
   * Update spawning
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    if (!this.isSpawning) return;

    const currentTime = Date.now() / 1000;
    const config = getEnemyConfig();

    // Check if it's time to spawn
    if (currentTime - this.spawnComponent.lastSpawnTime >= this.spawnComponent.spawnInterval) {
      this.spawnEnemy(entities, config);
      this.spawnComponent.lastSpawnTime = currentTime;
    }
  }

  /**
   * Spawn an enemy entity
   */
  private spawnEnemy(entities: Entity[], config: any): void {
    // Calculate cube count for current wave
    const cubeCount = config.baseCubes + (this.spawnComponent.currentWave * config.cubesPerWave);

    // Create enemy entity
    const enemy = new Entity('enemy');
    enemy.addComponent(new CombatComponent(cubeCount, cubeCount, 0, false));
    enemy.addComponent(new CubeClusterComponent(cubeCount, 1.0));
    enemy.addComponent(new AIComponent(
      config.ai.trackingSpeedMultiplier,
      config.ai.jumpTriggerDistance,
      config.ai.fastFallTriggerTime,
      config.ai.attackCooldown,
      0
    ));
    enemy.addComponent(new MovementComponent(10, 15, 30, true));
    enemy.addComponent(new PhysicsComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));

    // Add to entities (in a real system, this would go through EntityManager)
    entities.push(enemy);
  }

  /**
   * Advance to next wave
   */
  advanceWave(): void {
    this.spawnComponent.currentWave++;

    // Decrease spawn interval (but not below minimum)
    const config = getEnemyConfig();
    const newInterval = config.baseSpawnInterval - (this.spawnComponent.currentWave * 0.5);
    this.spawnComponent.spawnInterval = Math.max(newInterval, config.minSpawnInterval);
  }

  /**
   * Start spawning enemies
   */
  startSpawning(): void {
    this.isSpawning = true;
    this.spawnComponent.lastSpawnTime = Date.now() / 1000;
  }

  /**
   * Stop spawning enemies
   */
  stopSpawning(): void {
    this.isSpawning = false;
  }

  /**
   * Get spawn component for testing
   */
  getSpawnComponent(): SpawnComponent {
    return this.spawnComponent;
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    this.stopSpawning();
  }
}
