import * as THREE from 'three';
import Ammo from 'ammo.js';

/**
 * PhysicsBody - Wrapper for Ammo.js rigid body
 */
export class PhysicsBody {
  private body: any; // Ammo.btRigidBody
  private motionState: any; // Ammo.btDefaultMotionState
  private mass: number;

  constructor(body: any, motionState: any, mass: number) {
    this.body = body;
    this.motionState = motionState;
    this.mass = mass;
  }

  /**
   * Get current position
   */
  getPosition(): THREE.Vector3 {
    const transform = this.body.getWorldTransform();
    const origin = transform.getOrigin();
    return new THREE.Vector3(origin.x(), origin.y(), origin.z());
  }

  /**
   * Get current rotation (quaternion)
   */
  getRotation(): THREE.Quaternion {
    const transform = this.body.getWorldTransform();
    const rotation = transform.getRotation();
    return new THREE.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w());
  }

  /**
   * Check if body is static
   */
  isStatic(): boolean {
    return this.mass === 0;
  }

  /**
   * Get the underlying Ammo.js rigid body
   */
  getBody(): any {
    return this.body;
  }

  /**
   * Set position
   */
  setPosition(position: THREE.Vector3): void {
    const transform = this.body.getWorldTransform();
    const origin = transform.getOrigin();
    origin.setValue(position.x, position.y, position.z);
    this.body.setWorldTransform(transform);
    this.body.activate();
  }

  /**
   * Apply force
   */
  applyForce(force: THREE.Vector3, relativePosition: THREE.Vector3): void {
    this.body.applyForce(
      new Ammo.btVector3(force.x, force.y, force.z),
      new Ammo.btVector3(relativePosition.x, relativePosition.y, relativePosition.z)
    );
    this.body.activate();
  }

  /**
   * Apply impulse
   */
  applyImpulse(impulse: THREE.Vector3, relativePosition: THREE.Vector3): void {
    this.body.applyImpulse(
      new Ammo.btVector3(impulse.x, impulse.y, impulse.z),
      new Ammo.btVector3(relativePosition.x, relativePosition.y, relativePosition.z)
    );
    this.body.activate();
  }

  /**
   * Set linear velocity
   */
  setLinearVelocity(velocity: THREE.Vector3): void {
    const linearVelocity = this.body.getLinearVelocity();
    linearVelocity.setValue(velocity.x, velocity.y, velocity.z);
    this.body.activate();
  }

  /**
   * Get linear velocity
   */
  getLinearVelocity(): THREE.Vector3 {
    const velocity = this.body.getLinearVelocity();
    return new THREE.Vector3(velocity.x(), velocity.y(), velocity.z());
  }
}
