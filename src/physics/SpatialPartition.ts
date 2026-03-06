import { Entity } from '@/core/Entity';
import * as THREE from 'three';

/**
 * Cell coordinate
 */
export interface CellCoord {
  x: number;
  z: number;
}

/**
 * SpatialPartition - Spatial partitioning for collision optimization
 *
 * Divides scene into 10m grid cells for O(n) collision detection
 */
export class SpatialPartition {
  private gridSize: number;
  private grid: Map<string, Entity[]> = new Map();
  private entityCells: Map<Entity, CellCoord> = new Map();

  constructor(gridSize: number = 10) {
    this.gridSize = gridSize;
  }

  /**
   * Get grid cell key for coordinates
   * @param x - Cell X coordinate
   * @param z - Cell Z coordinate
   * @returns Grid key string
   */
  private getCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  /**
   * Calculate cell coordinates from position
   * @param position - World position
   * @returns Cell coordinates
   */
  getCellCoordinates(position: THREE.Vector3): CellCoord {
    return {
      x: Math.floor(position.x / this.gridSize),
      z: Math.floor(position.z / this.gridSize)
    };
  }

  /**
   * Add entity to grid
   * @param entity - Entity to add
   */
  addEntity(entity: Entity): void {
    const pos = entity.getPosition();
    const cell = this.getCellCoordinates(pos);
    const key = this.getCellKey(cell.x, cell.z);

    // Add to grid cell
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(entity);

    // Track entity's cell
    this.entityCells.set(entity, cell);
  }

  /**
   * Update entity position in grid
   * @param entity - Entity to update
   */
  updateEntity(entity: Entity): void {
    // Remove from old cell
    this.removeEntity(entity);

    // Add to new cell
    this.addEntity(entity);
  }

  /**
   * Remove entity from grid
   * @param entity - Entity to remove
   */
  removeEntity(entity: Entity): void {
    const cell = this.entityCells.get(entity);
    if (!cell) return;

    const key = this.getCellKey(cell.x, cell.z);
    const entities = this.grid.get(key);

    if (entities) {
      const index = entities.indexOf(entity);
      if (index >= 0) {
        entities.splice(index, 1);
      }

      // Remove empty cells
      if (entities.length === 0) {
        this.grid.delete(key);
      }
    }

    this.entityCells.delete(entity);
  }

  /**
   * Get entities in specific cell
   * @param x - Cell X coordinate
   * @param z - Cell Z coordinate
   * @returns Array of entities in cell
   */
  getEntitiesInCell(x: number, z: number): Entity[] {
    const key = this.getCellKey(x, z);
    return this.grid.get(key) || [];
  }

  /**
   * Get adjacent cell coordinates (including center)
   * @param x - Center cell X
   * @param z - Center cell Z
   * @returns Array of adjacent cell coordinates
   */
  getAdjacentCells(x: number, z: number): CellCoord[] {
    const cells: CellCoord[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        cells.push({ x: x + dx, z: z + dz });
      }
    }

    return cells;
  }

  /**
   * Get nearby entities (same + adjacent cells)
   * @param position - Center position
   * @returns Array of nearby entities
   */
  getNearbyEntities(position: THREE.Vector3): Entity[] {
    const centerCell = this.getCellCoordinates(position);
    const adjacentCells = this.getAdjacentCells(centerCell.x, centerCell.z);
    const nearbyEntities: Entity[] = [];

    for (const cell of adjacentCells) {
      const entities = this.getEntitiesInCell(cell.x, cell.z);
      nearbyEntities.push(...entities);
    }

    return nearbyEntities;
  }

  /**
   * Get total entity count
   * @returns Number of entities in grid
   */
  getEntityCount(): number {
    return this.entityCells.size;
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.grid.clear();
    this.entityCells.clear();
  }

  /**
   * Dispose of spatial partition
   */
  dispose(): void {
    this.clear();
  }
}
