import { Component } from '@/core/Component';

/**
 * MovementComponent - Stores movement state
 */
export class MovementComponent extends Component {
  constructor(
    public rollSpeed: number = 10,
    public jumpForce: number = 15,
    public fastFallSpeed: number = 30,
    public isGrounded: boolean = true
  ) {
    super('MovementComponent');
  }
}

/**
 * CubeClusterComponent - Stores cube cluster data
 */
export class CubeClusterComponent extends Component {
  constructor(
    public cubeCount: number = 8,
    public cubeSize: number = 1.0
  ) {
    super('CubeClusterComponent');
  }
}

/**
 * PhysicsComponent - Stores physics body reference
 */
export class PhysicsComponent extends Component {
  constructor(
    public velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    public angularVelocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ) {
    super('PhysicsComponent');
  }
}

/**
 * RenderComponent - Stores render mesh reference
 */
export class RenderComponent extends Component {
  constructor(
    public meshVisible: boolean = true,
    public scale: number = 1.0
  ) {
    super('RenderComponent');
  }
}

/**
 * PlayerControlComponent - Marks entity as player-controlled
 */
export class PlayerControlComponent extends Component {
  constructor(
    public forwardDirection: number = 0 // Radians
  ) {
    super('PlayerControlComponent');
  }
}

/**
 * CombatComponent - Stores combat state
 */
export class CombatComponent extends Component {
  constructor(
    public health: number = 8,
    public maxHealth: number = 8,
    public accumulatedDamage: number = 0,
    public isDead: boolean = false
  ) {
    super('CombatComponent');
  }
}

/**
 * DroppedCubeComponent - Marks entity as a dropped cube
 */
export class DroppedCubeComponent extends Component {
  constructor(
    public value: number = 1,
    public lifetime: number = 10.0 // Seconds
  ) {
    super('DroppedCubeComponent');
  }
}

/**
 * AbsorptionComponent - Stores absorption buffer
 */
export class AbsorptionComponent extends Component {
  constructor(
    public buffer: number = 0.0,
    public maxBuffer: number = 1.0
  ) {
    super('AbsorptionComponent');
  }
}
