import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Entity } from '@/core/Entity';
import { Component } from '@/core/Component';

class TestComponent extends Component {
  constructor(public value: number = 0) {
    super('TestComponent');
  }
}

describe('ECS Foundation - Entity', () => {
  it('should create entity with unique ID', () => {
    const entity1 = new Entity('test');
    const entity2 = new Entity('test');

    expect(entity1.getId()).toBeDefined();
    expect(entity2.getId()).toBeDefined();
    expect(entity1.getId()).not.toBe(entity2.getId());
  });

  it('should create entity with type', () => {
    const entity = new Entity('player');

    expect(entity.getType()).toBe('player');
  });

  it('should have initial position at origin', () => {
    const entity = new Entity('test');

    const position = entity.getPosition();
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
    expect(position.z).toBe(0);
  });

  it('should set and get position', () => {
    const entity = new Entity('test');

    entity.setPosition({ x: 10, y: 20, z: 30 });

    const position = entity.getPosition();
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);
    expect(position.z).toBe(30);
  });

  it('should attach component to entity', () => {
    const entity = new Entity('test');
    const component = new TestComponent(42);

    entity.addComponent(component);

    expect(entity.hasComponent('TestComponent')).toBe(true);
  });

  it('should get component from entity', () => {
    const entity = new Entity('test');
    const component = new TestComponent(42);

    entity.addComponent(component);
    const retrieved = entity.getComponent('TestComponent');

    expect(retrieved).toBe(component);
    expect((retrieved as TestComponent).value).toBe(42);
  });

  it('should detach component from entity', () => {
    const entity = new Entity('test');
    const component = new TestComponent();

    entity.addComponent(component);
    expect(entity.hasComponent('TestComponent')).toBe(true);

    entity.removeComponent('TestComponent');
    expect(entity.hasComponent('TestComponent')).toBe(false);
  });

  it('should get all components', () => {
    const entity = new Entity('test');
    const comp1 = new TestComponent(1);

    // Create different component type
    class TestComponent2 extends Component {
      constructor(public value: number = 0) {
        super('TestComponent2');
      }
    }
    const comp2 = new TestComponent2(2);

    entity.addComponent(comp1);
    entity.addComponent(comp2);

    const components = entity.getAllComponents();
    expect(components.length).toBe(2);
  });

  it('should mark entity as active by default', () => {
    const entity = new Entity('test');

    expect(entity.isActive()).toBe(true);
  });

  it('should activate and deactivate entity', () => {
    const entity = new Entity('test');

    entity.setActive(false);
    expect(entity.isActive()).toBe(false);

    entity.setActive(true);
    expect(entity.isActive()).toBe(true);
  });
});
