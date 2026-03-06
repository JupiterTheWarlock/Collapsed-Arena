import * as THREE from 'three';
import { Component } from './Component';

/**
 * Entity - Represents a game object with components
 *
 * Entities have a unique ID, type, position, and collection of components
 */
export class Entity {
  private static nextId: number = 0;
  private readonly id: string;
  private readonly type: string;
  private position: THREE.Vector3;
  private components: Map<string, Component>;
  private active: boolean;

  constructor(type: string) {
    this.id = `${type}_${Entity.nextId++}`;
    this.type = type;
    this.position = new THREE.Vector3(0, 0, 0);
    this.components = new Map();
    this.active = true;
  }

  /**
   * Get unique entity ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get entity type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Get entity position
   */
  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Set entity position
   */
  setPosition(position: { x: number; y: number; z: number }): void {
    this.position.set(position.x, position.y, position.z);
  }

  /**
   * Add component to entity
   */
  addComponent(component: Component): void {
    const type = component.getType();
    this.components.set(type, component);

    if (component.onAttach) {
      component.onAttach();
    }
  }

  /**
   * Get component by type
   */
  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * Check if entity has component
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Remove component from entity
   */
  removeComponent(type: string): void {
    const component = this.components.get(type);
    if (component) {
      if (component.onDetach) {
        component.onDetach();
      }
      this.components.delete(type);
    }
  }

  /**
   * Get all components
   */
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Check if entity is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Set entity active state
   */
  setActive(active: boolean): void {
    this.active = active;
  }
}
