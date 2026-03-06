import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpatialPartition } from '@/physics/SpatialPartition';
import { Entity } from '@/core/Entity';
import * as THREE from 'three';

describe('Physics - SpatialPartition', () => {
  let spatialPartition: SpatialPartition;

  beforeEach(() => {
    spatialPartition = new SpatialPartition(10);  // 10m grid size
  });

  afterEach(() => {
    if (spatialPartition) {
      spatialPartition.dispose();
    }
  });

  it('should initialize with empty grid', () => {
    expect(spatialPartition.getEntityCount()).toBe(0);
  });

  it('should add entity to grid', () => {
    const entity = new Entity('test');
    entity.setPosition(new THREE.Vector3(5, 0, 5));

    spatialPartition.addEntity(entity);

    expect(spatialPartition.getEntityCount()).toBe(1);
  });

  it('should calculate grid cell coordinates correctly', () => {
    // Grid size 10m
    // Position (0,0,0) -> Cell (0,0)
    // Position (5,0,5) -> Cell (0,0)
    // Position (10,0,10) -> Cell (1,1)
    // Position (-5,0,-5) -> Cell (-1,-1)

    expect(spatialPartition.getCellCoordinates(new THREE.Vector3(0, 0, 0))).toEqual({ x: 0, z: 0 });
    expect(spatialPartition.getCellCoordinates(new THREE.Vector3(5, 0, 5))).toEqual({ x: 0, z: 0 });
    expect(spatialPartition.getCellCoordinates(new THREE.Vector3(10, 0, 10))).toEqual({ x: 1, z: 1 });
    expect(spatialPartition.getCellCoordinates(new THREE.Vector3(-5, 0, -5))).toEqual({ x: -1, z: -1 });
  });

  it('should get entities in same cell', () => {
    const entity1 = new Entity('test1');
    entity1.setPosition(new THREE.Vector3(5, 0, 5));

    const entity2 = new Entity('test2');
    entity2.setPosition(new THREE.Vector3(6, 0, 6));

    const entity3 = new Entity('test3');
    entity3.setPosition(new THREE.Vector3(20, 0, 20));  // Different cell

    spatialPartition.addEntity(entity1);
    spatialPartition.addEntity(entity2);
    spatialPartition.addEntity(entity3);

    // Get entities in cell (0,0)
    const entitiesInCell = spatialPartition.getEntitiesInCell(0, 0);

    expect(entitiesInCell.length).toBe(2);
    expect(entitiesInCell).toContain(entity1);
    expect(entitiesInCell).toContain(entity2);
    expect(entitiesInCell).not.toContain(entity3);
  });

  it('should get adjacent cell coordinates', () => {
    const center = { x: 0, z: 0 };
    const adjacent = spatialPartition.getAdjacentCells(center.x, center.z);

    expect(adjacent.length).toBe(9);  // 3x3 grid including center
  });

  it('should get nearby entities (same + adjacent cells)', () => {
    const entity1 = new Entity('test1');
    entity1.setPosition(new THREE.Vector3(5, 0, 5));  // Cell (0,0)

    const entity2 = new Entity('test2');
    entity2.setPosition(new THREE.Vector3(15, 0, 5));  // Cell (1,0) - adjacent

    const entity3 = new Entity('test3');
    entity3.setPosition(new THREE.Vector3(25, 0, 5));  // Cell (2,0) - not adjacent

    spatialPartition.addEntity(entity1);
    spatialPartition.addEntity(entity2);
    spatialPartition.addEntity(entity3);

    // Get nearby entities for entity at (5,0,5)
    const nearby = spatialPartition.getNearbyEntities(entity1.getPosition());

    expect(nearby.length).toBe(2);
    expect(nearby).toContain(entity1);
    expect(nearby).toContain(entity2);
    expect(nearby).not.toContain(entity3);
  });

  it('should update entity position', () => {
    const entity = new Entity('test');
    entity.setPosition(new THREE.Vector3(5, 0, 5));

    spatialPartition.addEntity(entity);

    // Move to different cell
    entity.setPosition(new THREE.Vector3(15, 0, 5));
    spatialPartition.updateEntity(entity);

    // Should be in cell (1,0) now
    const entitiesInCell0 = spatialPartition.getEntitiesInCell(0, 0);
    const entitiesInCell1 = spatialPartition.getEntitiesInCell(1, 0);

    expect(entitiesInCell0.length).toBe(0);
    expect(entitiesInCell1.length).toBe(1);
  });

  it('should remove entity from grid', () => {
    const entity = new Entity('test');
    entity.setPosition(new THREE.Vector3(5, 0, 5));

    spatialPartition.addEntity(entity);
    expect(spatialPartition.getEntityCount()).toBe(1);

    spatialPartition.removeEntity(entity);
    expect(spatialPartition.getEntityCount()).toBe(0);
  });

  it('should clear all entities', () => {
    for (let i = 0; i < 10; i++) {
      const entity = new Entity(`test${i}`);
      entity.setPosition(new THREE.Vector3(i * 5, 0, 0));
      spatialPartition.addEntity(entity);
    }

    expect(spatialPartition.getEntityCount()).toBe(10);

    spatialPartition.clear();
    expect(spatialPartition.getEntityCount()).toBe(0);
  });
});
