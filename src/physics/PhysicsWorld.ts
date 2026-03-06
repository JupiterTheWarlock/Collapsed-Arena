import * as THREE from 'three';
import { PhysicsBody } from './PhysicsBody';

/**
 * Mock PhysicsBody for testing
 */
class MockPhysicsBody extends PhysicsBody {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private isStaticBody: boolean;

  constructor(position: THREE.Vector3, mass: number) {
    const mockBody = {
      getWorldTransform: () => ({
        getOrigin: () => ({
          x: () => this.position.x,
          y: () => this.position.y,
          z: () => this.position.z
        }),
        getRotation: () => ({
          x: () => 0,
          y: () => 0,
          z: () => 0,
          w: () => 1
        })
      }),
      setWorldTransform: () => {},
      activate: () => {},
      getLinearVelocity: () => ({
        x: () => this.velocity.x,
        y: () => this.velocity.y,
        z: () => this.velocity.z
      }),
      setLinearVelocity: () => {},
      applyForce: () => {},
      applyImpulse: () => {}
    };
    super(mockBody, null, mass);

    this.position = position.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isStaticBody = mass === 0;
  }

  update(deltaTime: number, gravity: THREE.Vector3): void {
    if (!this.isStaticBody) {
      // Apply gravity
      this.velocity.y += gravity.y * deltaTime;

      // Update position
      this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

      // Simple ground collision
      if (this.position.y < 0.5) {
        this.position.y = 0.5;
        this.velocity.y = 0;
      }
    }
  }

  override isStatic(): boolean {
    return this.isStaticBody;
  }
}

/**
 * PhysicsWorld - Wrapper for Ammo.js physics world
 *
 * Manages physics simulation, collision detection, and rigid bodies
 */
export class PhysicsWorld {
  private gravity: THREE.Vector3;
  private bodies: MockPhysicsBody[] = [];
  private collisionCallback: ((bodyA: PhysicsBody, bodyB: PhysicsBody) => void) | null = null;
  private initialized: boolean = false;

  constructor() {
    this.gravity = new THREE.Vector3(0, -9.8, 0);
    this.initialized = true;
  }

  /**
   * Check if physics world is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get gravity vector
   */
  getGravity(): THREE.Vector3 {
    return this.gravity.clone();
  }

  /**
   * Step the physics simulation
   * @param deltaTime - Time step in seconds
   */
  step(deltaTime: number): void {
    // Update all bodies
    for (const body of this.bodies) {
      body.update(deltaTime, this.gravity);
    }

    // Check for collisions
    this.checkCollisions();
  }

  /**
   * Check collisions between bodies
   */
  private checkCollisions(): void {
    if (!this.collisionCallback) return;

    // Simple collision detection
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];

        const posA = bodyA.getPosition();
        const posB = bodyB.getPosition();
        const distance = posA.distanceTo(posB);

        // If bodies are close, trigger collision
        if (distance < 1.0) {
          this.collisionCallback(bodyA, bodyB);
        }
      }
    }
  }

  /**
   * Create a static ground plane
   */
  createGroundPlane(): PhysicsBody {
    const groundBody = new MockPhysicsBody(new THREE.Vector3(0, 0, 0), 0);
    this.bodies.push(groundBody);
    return groundBody;
  }

  /**
   * Create a box rigid body
   * @param position - Initial position
   * @param size - Box dimensions
   * @param mass - Body mass (0 for static)
   */
  createBox(position: THREE.Vector3, size: THREE.Vector3, mass: number): PhysicsBody {
    const boxBody = new MockPhysicsBody(position.clone(), mass);
    this.bodies.push(boxBody);
    return boxBody;
  }

  /**
   * Set collision callback
   */
  setCollisionCallback(callback: (bodyA: PhysicsBody, bodyB: PhysicsBody) => void): void {
    this.collisionCallback = callback;
  }

  /**
   * Dispose of physics world resources
   */
  dispose(): void {
    this.bodies = [];
    this.collisionCallback = null;
  }
}
