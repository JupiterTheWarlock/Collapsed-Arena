import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { MovementComponent, PhysicsComponent, PlayerControlComponent, CubeClusterComponent } from '@/components';
import { getPlayerConfig } from '@/config/config-loader';

/**
 * MovementSystem - Handles player movement
 *
 * Implements roll, jump, fast-fall, and mouse direction control
 */
export class MovementSystem extends System {
  private jumpRequested: boolean = false;
  private fastFallRequested: boolean = false;
  private targetDirection: number = 0;

  constructor() {
    super('MovementSystem');
  }

  /**
   * Update movement for all player entities
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(_deltaTime: number, entities: Entity[]): void {
    // Get player config values
    const playerConfig = getPlayerConfig();

    // Find all player-controlled entities
    for (const entity of entities) {
      if (!entity.isActive()) continue;

      const playerControl = entity.getComponent('PlayerControlComponent') as PlayerControlComponent;
      const movement = entity.getComponent('MovementComponent') as MovementComponent;
      const physics = entity.getComponent('PhysicsComponent') as PhysicsComponent;
      const cluster = entity.getComponent('CubeClusterComponent') as CubeClusterComponent;

      // Only process entities with required components
      if (!playerControl || !movement || !physics || !cluster) continue;

      // Apply auto-scroll (constant forward force)
      this.applyAutoScroll(movement, physics, cluster, playerControl);

      // Process jump
      if (this.jumpRequested && movement.isGrounded) {
        this.applyJump(movement, physics, playerConfig.jumpForce);
        this.jumpRequested = false;
        movement.isGrounded = false;
      }

      // Process fast-fall
      if (this.fastFallRequested && !movement.isGrounded) {
        this.applyFastFall(movement, physics, playerConfig.fastFallSpeed);
        this.fastFallRequested = false;
      }

      // Update direction
      playerControl.forwardDirection = this.targetDirection;
    }
  }

  /**
   * Apply constant forward force (auto-scroll)
   * Applies force in the direction the player is facing
   * Speed is dynamically calculated based on cube cluster size
   */
  private applyAutoScroll(
    movement: MovementComponent,
    physics: PhysicsComponent,
    cluster: CubeClusterComponent,
    playerControl: PlayerControlComponent
  ): void {
    // Get player's forward direction
    const direction = playerControl.forwardDirection;

    // Calculate dynamic speed based on cube count
    // Formula: diameter = 2 × cubeCount^(1/3)
    // This ensures the player always moves one "body length" per second
    const diameter = 2 * Math.pow(cluster.cubeCount, 1/3);

    // Set target velocity (not accumulate) for consistent rolling speed
    physics.velocity.x = Math.sin(direction) * diameter;
    physics.velocity.z = Math.cos(direction) * diameter;
  }

  /**
   * Apply jump force
   */
  private applyJump(
    movement: MovementComponent,
    physics: PhysicsComponent,
    jumpForce: number
  ): void {
    physics.velocity.y = jumpForce;
  }

  /**
   * Apply fast-fall force
   */
  private applyFastFall(
    movement: MovementComponent,
    physics: PhysicsComponent,
    fastFallSpeed: number
  ): void {
    physics.velocity.y = -fastFallSpeed;
  }

  /**
   * Trigger jump on next update
   */
  triggerJump(): void {
    this.jumpRequested = true;
  }

  /**
   * Trigger fast-fall on next update
   */
  triggerFastFall(): void {
    this.fastFallRequested = true;
  }

  /**
   * Set movement direction
   * @param direction - Direction in radians
   */
  setDirection(direction: number): void {
    this.targetDirection = direction;
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    // Nothing to dispose
  }
}
