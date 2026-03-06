import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MovementSystem } from '@/systems/MovementSystem';
import { Entity } from '@/core/Entity';
import { MovementComponent, CubeClusterComponent, PhysicsComponent, PlayerControlComponent } from '@/components';

describe('Core Mechanics - MovementSystem', () => {
  let movementSystem: MovementSystem;
  let playerEntity: Entity;

  beforeEach(() => {
    movementSystem = new MovementSystem();

    // Create player entity
    playerEntity = new Entity('player');
    playerEntity.addComponent(new MovementComponent(10, 15, 30, true));
    playerEntity.addComponent(new CubeClusterComponent(8, 1.0));
    playerEntity.addComponent(new PhysicsComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    playerEntity.addComponent(new PlayerControlComponent(0));
  });

  afterEach(() => {
    if (movementSystem) {
      movementSystem.dispose();
    }
  });

  it('should create player with 8 cubes from config', () => {
    const cubeCluster = playerEntity.getComponent('CubeClusterComponent') as CubeClusterComponent;

    expect(cubeCluster).toBeDefined();
    expect(cubeCluster.cubeCount).toBe(8);
  });

  it('should apply constant forward force for auto-scroll', () => {
    const physics = playerEntity.getComponent('PhysicsComponent') as PhysicsComponent;
    const movement = playerEntity.getComponent('MovementComponent') as MovementComponent;

    const entities = [playerEntity];
    movementSystem.update(1/60, entities);

    // Should have forward velocity
    expect(physics.velocity.z).toBeGreaterThan(0);
  });

  it('should apply jump force when input triggered', () => {
    const physics = playerEntity.getComponent('PhysicsComponent') as PhysicsComponent;
    const movement = playerEntity.getComponent('MovementComponent') as MovementComponent;

    // Trigger jump
    movementSystem.triggerJump();

    const entities = [playerEntity];
    movementSystem.update(1/60, entities);

    // Should have upward velocity
    expect(physics.velocity.y).toBeGreaterThan(0);
  });

  it('should apply fast-fall when airborne and input triggered', () => {
    const physics = playerEntity.getComponent('PhysicsComponent') as PhysicsComponent;
    const movement = playerEntity.getComponent('MovementComponent') as MovementComponent;

    // Set airborne
    movement.isGrounded = false;

    // Trigger fast-fall
    movementSystem.triggerFastFall();

    const entities = [playerEntity];
    movementSystem.update(1/60, entities);

    // Should have downward velocity
    expect(physics.velocity.y).toBeLessThan(0);
  });

  it('should change forward direction based on mouse input', () => {
    const playerControl = playerEntity.getComponent('PlayerControlComponent') as PlayerControlComponent;

    // Change direction
    movementSystem.setDirection(Math.PI / 2); // 90 degrees

    const entities = [playerEntity];
    movementSystem.update(1/60, entities);

    expect(playerControl.forwardDirection).toBe(Math.PI / 2);
  });
});
