import { Entity } from './Entity';

/**
 * System - Base class for all ECS systems
 *
 * Systems contain logic that operates on entities with specific components
 */
export abstract class System {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Get system name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Update method called every frame
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  abstract update(deltaTime: number, entities: Entity[]): void;

  /**
   * Called when system is initialized
   */
  onInit?(): void;

  /**
   * Called when system is destroyed
   */
  onDestroy?(): void;
}
