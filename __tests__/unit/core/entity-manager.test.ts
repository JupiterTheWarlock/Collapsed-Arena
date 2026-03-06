import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EntityManager } from '@/core/EntityManager';
import { Entity } from '@/core/Entity';
import { Component } from '@/core/Component';

class TestComponent extends Component {
  constructor(public value: number = 0) {
    super('TestComponent');
  }
}

class MovementComponent extends Component {
  constructor(public speed: number = 10) {
    super('MovementComponent');
  }
}

describe('ECS Foundation - EntityManager', () => {
  let entityManager: EntityManager;

  beforeEach(() => {
    entityManager = new EntityManager();
  });

  afterEach(() => {
    if (entityManager) {
      entityManager.dispose();
    }
  });

  it('should create entity with type', () => {
    const entity = entityManager.createEntity('player');

    expect(entity).toBeDefined();
    expect(entity.getType()).toBe('player');
  });

  it('should track all created entities', () => {
    const entity1 = entityManager.createEntity('player');
    const entity2 = entityManager.createEntity('enemy');

    const allEntities = entityManager.getAllEntities();

    expect(allEntities.length).toBe(2);
    expect(allEntities).toContain(entity1);
    expect(allEntities).toContain(entity2);
  });

  it('should get entity by ID', () => {
    const entity = entityManager.createEntity('player');
    const entityId = entity.getId();

    const retrieved = entityManager.getEntity(entityId);

    expect(retrieved).toBe(entity);
  });

  it('should return undefined for non-existent entity', () => {
    const retrieved = entityManager.getEntity('nonexistent');

    expect(retrieved).toBeUndefined();
  });

  it('should query entities by component type', () => {
    const entity1 = entityManager.createEntity('player');
    const entity2 = entityManager.createEntity('enemy');

    entity1.addComponent(new TestComponent(1));
    entity2.addComponent(new MovementComponent(10));

    const withTest = entityManager.getEntitiesWithComponent('TestComponent');
    const withMovement = entityManager.getEntitiesWithComponent('MovementComponent');

    expect(withTest.length).toBe(1);
    expect(withTest[0]).toBe(entity1);
    expect(withMovement.length).toBe(1);
    expect(withMovement[0]).toBe(entity2);
  });

  it('should destroy entity', () => {
    const entity = entityManager.createEntity('player');
    const entityId = entity.getId();

    entityManager.destroyEntity(entityId);

    const retrieved = entityManager.getEntity(entityId);
    expect(retrieved).toBeUndefined();
  });

  it('should remove destroyed entity from all entities list', () => {
    const entity1 = entityManager.createEntity('player');
    const entity2 = entityManager.createEntity('enemy');

    entityManager.destroyEntity(entity1.getId());

    const allEntities = entityManager.getAllEntities();
    expect(allEntities.length).toBe(1);
    expect(allEntities[0]).toBe(entity2);
  });

  it('should get only active entities', () => {
    const entity1 = entityManager.createEntity('player');
    const entity2 = entityManager.createEntity('enemy');

    entity2.setActive(false);

    const activeEntities = entityManager.getActiveEntities();

    expect(activeEntities.length).toBe(1);
    expect(activeEntities[0]).toBe(entity1);
  });

  it('should clear all entities', () => {
    entityManager.createEntity('player');
    entityManager.createEntity('enemy');
    entityManager.createEntity('obstacle');

    entityManager.clear();

    const allEntities = entityManager.getAllEntities();
    expect(allEntities.length).toBe(0);
  });
});
