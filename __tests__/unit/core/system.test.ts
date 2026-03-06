import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { Component } from '@/core/Component';

class TestComponent extends Component {
  constructor(public value: number = 0) {
    super('TestComponent');
  }
}

class TestSystem extends System {
  public updateCalled: boolean = false;
  public lastDeltaTime: number = 0;
  public processedEntities: Entity[] = [];

  constructor() {
    super('TestSystem');
  }

  update(deltaTime: number, entities: Entity[]): void {
    this.updateCalled = true;
    this.lastDeltaTime = deltaTime;
    this.processedEntities = entities;
  }
}

describe('ECS Foundation - System', () => {
  it('should create system with name', () => {
    const system = new TestSystem();

    expect(system.getName()).toBe('TestSystem');
  });

  it('should have update method', () => {
    const system = new TestSystem();
    const entities: Entity[] = [];

    system.update(1/60, entities);

    expect(system.updateCalled).toBe(true);
  });

  it('should receive delta time in update', () => {
    const system = new TestSystem();
    const entities: Entity[] = [];

    system.update(0.5, entities);

    expect(system.lastDeltaTime).toBe(0.5);
  });

  it('should receive entities in update', () => {
    const system = new TestSystem();
    const entity1 = new Entity('test');
    const entity2 = new Entity('test');
    const entities = [entity1, entity2];

    system.update(1/60, entities);

    expect(system.processedEntities).toEqual(entities);
  });
});
