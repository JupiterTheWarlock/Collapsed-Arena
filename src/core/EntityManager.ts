import { Entity } from './Entity';

/**
 * EntityManager - Manages entity lifecycle
 *
 * Creates, destroys, and queries entities
 */
export class EntityManager {
  private entities: Map<string, Entity>;
  private nextEntityId: number;

  constructor() {
    this.entities = new Map();
    this.nextEntityId = 0;
  }

  /**
   * Create a new entity
   * @param type - Entity type identifier
   * @returns The created entity
   */
  createEntity(type: string): Entity {
    const entity = new Entity(type);
    const id = entity.getId();

    this.entities.set(id, entity);

    return entity;
  }

  /**
   * Get entity by ID
   * @param id - Entity ID
   * @returns Entity or undefined if not found
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Get all entities
   * @returns Array of all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entities with specific component
   * @param componentType - Component type to filter by
   * @returns Array of entities with the component
   */
  getEntitiesWithComponent(componentType: string): Entity[] {
    const entities: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (entity.isActive() && entity.hasComponent(componentType)) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Get only active entities
   * @returns Array of active entities
   */
  getActiveEntities(): Entity[] {
    const entities: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (entity.isActive()) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Destroy an entity
   * @param id - Entity ID to destroy
   */
  destroyEntity(id: string): void {
    this.entities.delete(id);
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
  }

  /**
   * Get entity count
   * @returns Number of entities
   */
  getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Dispose of entity manager
   */
  dispose(): void {
    this.clear();
  }
}
