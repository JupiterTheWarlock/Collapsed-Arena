import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { getEnemyConfig } from '@/config/config-loader';

/**
 * DifficultySystem - Dynamic difficulty adjustment
 *
 * Tracks player kill rate over time and adjusts spawn rate/intensity
 */
export class DifficultySystem extends System {
  private difficultyMultiplier: number = 1.0;
  private killHistory: Array<{ gameTime: number }> = [];
  private trackingWindow: number = 30.0; // 30 seconds
  private currentGameTime: number = 0.0; // Accumulated game time

  constructor() {
    super('DifficultySystem');
  }

  /**
   * Update difficulty based on player performance
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    // Accumulate game time
    this.currentGameTime += deltaTime;

    const config = getEnemyConfig();

    // Remove kills outside tracking window
    this.killHistory = this.killHistory.filter(
      kill => this.currentGameTime - kill.gameTime <= this.trackingWindow
    );

    // Calculate kills per second
    const killRate = this.killHistory.length / this.trackingWindow;

    // Base kill rate: 1 kill every 5 seconds = 0.2 kills/sec
    const baseKillRate = 0.2;

    // Adjust difficulty multiplier based on kill rate
    // Higher kill rate = higher difficulty
    const rateDifference = killRate - baseKillRate;

    // Adjust multiplier: ±30% based on performance
    const adjustment = rateDifference * 2.0; // Amplify effect

    this.difficultyMultiplier = 1.0 + adjustment;

    // Clamp within config range
    const maxMultiplier = 1.0 + config.difficultyBalanceRange;
    const minMultiplier = 1.0 - config.difficultyBalanceRange;

    this.difficultyMultiplier = Math.max(minMultiplier, Math.min(maxMultiplier, this.difficultyMultiplier));
  }

  /**
   * Record a kill for difficulty tracking
   */
  recordKill(): void {
    this.killHistory.push({
      gameTime: this.currentGameTime
    });
  }

  /**
   * Get current difficulty multiplier
   * @returns Multiplier (0.7 to 1.3)
   */
  getDifficultyMultiplier(): number {
    return this.difficultyMultiplier;
  }

  /**
   * Get recent kill count (within tracking window)
   * @returns Number of kills in last 30 seconds
   */
  getRecentKillCount(): number {
    return this.killHistory.length;
  }

  /**
   * Calculate adjusted spawn interval based on difficulty
   * @param baseInterval - Base spawn interval in seconds
   * @returns Adjusted interval (higher difficulty = lower interval)
   */
  getAdjustedSpawnInterval(baseInterval: number): number {
    // Higher multiplier = lower interval (faster spawns)
    return baseInterval / this.difficultyMultiplier;
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    this.killHistory = [];
  }
}
