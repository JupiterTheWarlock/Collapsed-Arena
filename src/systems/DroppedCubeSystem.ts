import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { DroppedCubeComponent } from '@/components';
import * as THREE from 'three';

/**
 * DroppedCubeSystem - Manages dropped cube lifecycle
 *
 * Handles cube lifetime, max count, and distance queries
 */
export class DroppedCubeSystem extends System {
  private droppedCubes: Entity[] = [];
  private maxCubes: number = 200;
  private cubeLifetimes: Map<Entity, number> = new Map();  // Spawn time (game time)
  private currentGameTime: number = 0.0;  // Accumulated game time

  constructor() {
    super('DroppedCubeSystem');
  }

  /**
   * Update dropped cubes (remove expired)
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    // Accumulate game time
    this.currentGameTime += deltaTime;

    // Update lifetimes and remove expired cubes
    for (let i = this.droppedCubes.length - 1; i >= 0; i--) {
      const cube = this.droppedCubes[i];
      const droppedComp = cube.getComponent('DroppedCubeComponent') as DroppedCubeComponent;

      if (!droppedComp) {
        this.droppedCubes.splice(i, 1);
        this.cubeLifetimes.delete(cube);
        continue;
      }

      // Get spawn time
      const spawnTime = this.cubeLifetimes.get(cube) ?? this.currentGameTime;
      const age = this.currentGameTime - spawnTime;

      // Remove if expired
      if (age >= droppedComp.lifetime) {
        this.droppedCubes.splice(i, 1);
        this.cubeLifetimes.delete(cube);
      }
    }
  }

  /**
   * Add a dropped cube
   * @param entity - Dropped cube entity
   */
  addDroppedCube(entity: Entity): void {
    const droppedComp = entity.getComponent('DroppedCubeComponent') as DroppedCubeComponent;
    if (!droppedComp) return;

    // Remove oldest if at max capacity (FIFO)
    if (this.droppedCubes.length >= this.maxCubes) {
      const oldest = this.droppedCubes.shift();
      if (oldest) {
        this.cubeLifetimes.delete(oldest);
      }
    }

    this.droppedCubes.push(entity);
    this.cubeLifetimes.set(entity, this.currentGameTime);  // Use game time
  }

  /**
   * Remove specific cube
   * @param entity - Cube to remove
   */
  removeCube(entity: Entity): void {
    const index = this.droppedCubes.indexOf(entity);
    if (index >= 0) {
      this.droppedCubes.splice(index, 1);
      this.cubeLifetimes.delete(entity);
    }
  }

  /**
   * Get cubes within distance of position
   * @param position - Center position
   * @param distance - Maximum distance
   * @returns Array of cubes within distance
   */
  getCubesWithinDistance(position: THREE.Vector3, distance: number): Entity[] {
    return this.droppedCubes.filter(cube => {
      const cubePos = cube.getPosition();
      const dist = Math.sqrt(
        Math.pow(cubePos.x - position.x, 2) +
        Math.pow(cubePos.y - position.y, 2) +
        Math.pow(cubePos.z - position.z, 2)
      );
      return dist <= distance;
    });
  }

  /**
   * Get all dropped cubes
   * @returns Array of all dropped cubes
   */
  getAllCubes(): Entity[] {
    return [...this.droppedCubes];
  }

  /**
   * Get dropped cube count
   * @returns Number of dropped cubes
   */
  getCubeCount(): number {
    return this.droppedCubes.length;
  }

  /**
   * Clear all dropped cubes
   */
  clear(): void {
    this.droppedCubes = [];
    this.cubeLifetimes.clear();
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    this.clear();
  }
}
