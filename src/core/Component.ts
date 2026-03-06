/**
 * Component - Base class for all ECS components
 *
 * Components hold data but no logic
 */
export abstract class Component {
  protected readonly type: string;

  constructor(type: string) {
    this.type = type;
  }

  /**
   * Get component type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Called when component is added to entity
   */
  onAttach?(): void;

  /**
   * Called when component is removed from entity
   */
  onDetach?(): void;
}
