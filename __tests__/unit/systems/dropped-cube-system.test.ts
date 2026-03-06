import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DroppedCubeSystem } from '@/systems/DroppedCubeSystem';
import { Entity } from '@/core/Entity';
import { DroppedCubeComponent } from '@/components';
import * as THREE from 'three';

describe('Systems - DroppedCubeSystem', () => {
  let droppedCubeSystem: DroppedCubeSystem;

  beforeEach(() => {
    droppedCubeSystem = new DroppedCubeSystem();
  });

  afterEach(() => {
    if (droppedCubeSystem) {
      droppedCubeSystem.dispose();
    }
  });

  it('should initialize with empty cube list', () => {
    expect(droppedCubeSystem.getCubeCount()).toBe(0);
  });

  it('should add dropped cube', () => {
    const entity = new Entity('dropped_cube');
    entity.addComponent(new DroppedCubeComponent(1, 10.0));
    entity.setPosition(new THREE.Vector3(0, 5, 0));

    droppedCubeSystem.addDroppedCube(entity);

    expect(droppedCubeSystem.getCubeCount()).toBe(1);
  });

  it('should enforce max cubes limit (200)', () => {
    // Add more than 200 cubes
    for (let i = 0; i < 250; i++) {
      const entity = new Entity('dropped_cube');
      entity.addComponent(new DroppedCubeComponent(1, 10.0));
      entity.setPosition(new THREE.Vector3(i * 2, 5, 0));
      droppedCubeSystem.addDroppedCube(entity);
    }

    // Should be capped at 200
    expect(droppedCubeSystem.getCubeCount()).toBeLessThanOrEqual(200);
  });

  it('should remove oldest cubes when exceeding limit (FIFO)', () => {
    const cubes: Entity[] = [];

    // Add 201 cubes (one over limit)
    for (let i = 0; i < 201; i++) {
      const entity = new Entity('dropped_cube');
      entity.addComponent(new DroppedCubeComponent(i, 10.0));  // Value = index
      entity.setPosition(new THREE.Vector3(i * 2, 5, 0));
      cubes.push(entity);
      droppedCubeSystem.addDroppedCube(entity);
    }

    // First cube should be removed (FIFO)
    const allCubes = droppedCubeSystem.getAllCubes();
    const firstCubeValue = allCubes[0].getComponent('DroppedCubeComponent')?.value;

    expect(firstCubeValue).not.toBe(0);  // First cube (value 0) removed
  });

  it('should remove expired cubes after lifetime', () => {
    const entity = new Entity('dropped_cube');
    entity.addComponent(new DroppedCubeComponent(1, 1.0));  // 1 second lifetime
    entity.setPosition(new THREE.Vector3(0, 5, 0));

    droppedCubeSystem.addDroppedCube(entity);

    expect(droppedCubeSystem.getCubeCount()).toBe(1);

    // Update past lifetime
    droppedCubeSystem.update(1.5, [entity]);

    expect(droppedCubeSystem.getCubeCount()).toBe(0);
  });

  it('should get cubes within distance of position', () => {
    // Add cubes at different positions
    const nearCube = new Entity('dropped_cube');
    nearCube.addComponent(new DroppedCubeComponent(1, 10.0));
    nearCube.setPosition(new THREE.Vector3(5, 0, 5));

    const farCube = new Entity('dropped_cube');
    farCube.addComponent(new DroppedCubeComponent(1, 10.0));
    farCube.setPosition(new THREE.Vector3(100, 0, 100));

    droppedCubeSystem.addDroppedCube(nearCube);
    droppedCubeSystem.addDroppedCube(farCube);

    // Get cubes within 10m of origin
    const nearbyCubes = droppedCubeSystem.getCubesWithinDistance(new THREE.Vector3(0, 0, 0), 10);

    expect(nearbyCubes.length).toBe(1);
    expect(nearbyCubes[0]).toBe(nearCube);
  });

  it('should remove specific cube', () => {
    const entity = new Entity('dropped_cube');
    entity.addComponent(new DroppedCubeComponent(1, 10.0));
    entity.setPosition(new THREE.Vector3(0, 5, 0));

    droppedCubeSystem.addDroppedCube(entity);
    expect(droppedCubeSystem.getCubeCount()).toBe(1);

    droppedCubeSystem.removeCube(entity);
    expect(droppedCubeSystem.getCubeCount()).toBe(0);
  });

  it('should clear all cubes', () => {
    for (let i = 0; i < 10; i++) {
      const entity = new Entity('dropped_cube');
      entity.addComponent(new DroppedCubeComponent(1, 10.0));
      entity.setPosition(new THREE.Vector3(i * 2, 5, 0));
      droppedCubeSystem.addDroppedCube(entity);
    }

    expect(droppedCubeSystem.getCubeCount()).toBe(10);

    droppedCubeSystem.clear();
    expect(droppedCubeSystem.getCubeCount()).toBe(0);
  });
});
