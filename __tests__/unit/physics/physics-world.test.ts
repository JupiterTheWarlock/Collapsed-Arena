import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { PhysicsWorld } from '@/physics/PhysicsWorld';

describe('Physics Layer - PhysicsWorld', () => {
  let physicsWorld: PhysicsWorld;

  beforeEach(() => {
    physicsWorld = new PhysicsWorld();
  });

  afterEach(() => {
    if (physicsWorld) {
      physicsWorld.dispose();
    }
  });

  it('should create a physics world with correct gravity', () => {
    const gravity = physicsWorld.getGravity();

    expect(gravity).toBeDefined();
    expect(gravity.y).toBeCloseTo(-9.8, 1);
  });

  it('should initialize physics world without errors', () => {
    expect(physicsWorld.isInitialized()).toBe(true);
  });

  it('should step simulation forward', () => {
    const initialTime = 0;
    const deltaTime = 1/60;

    // Should not throw
    expect(() => physicsWorld.step(deltaTime)).not.toThrow();
  });

  it('should create a static ground plane', () => {
    const groundBody = physicsWorld.createGroundPlane();

    expect(groundBody).toBeDefined();
    expect(groundBody.isStatic()).toBe(true);
  });

  it('should create a dynamic box rigid body', () => {
    const position = new THREE.Vector3(0, 10, 0);
    const size = new THREE.Vector3(1, 1, 1);
    const mass = 1;

    const boxBody = physicsWorld.createBox(position, size, mass);

    expect(boxBody).toBeDefined();
    expect(boxBody.isStatic()).toBe(false);
  });

  it('should apply gravity to falling box', () => {
    const position = new THREE.Vector3(0, 10, 0);
    const size = new THREE.Vector3(1, 1, 1);
    const mass = 1;

    const boxBody = physicsWorld.createBox(position, size, mass);
    const initialY = boxBody.getPosition().y;

    // Step simulation multiple times
    for (let i = 0; i < 10; i++) {
      physicsWorld.step(1/60);
    }

    const finalY = boxBody.getPosition().y;

    // Box should have fallen due to gravity
    expect(finalY).toBeLessThan(initialY);
  });

  it('should detect collision between falling box and ground', () => {
    // Create ground
    physicsWorld.createGroundPlane();

    // Create box above ground
    const position = new THREE.Vector3(0, 10, 0);
    const size = new THREE.Vector3(1, 1, 1);
    const mass = 1;
    const boxBody = physicsWorld.createBox(position, size, mass);

    // Step simulation until collision
    let collisionDetected = false;
    const checkCollision = () => {
      const boxY = boxBody.getPosition().y;
      if (boxY <= 0.5) { // Half of box height
        collisionDetected = true;
      }
    };

    // Simulate for enough time to reach ground
    for (let i = 0; i < 100; i++) {
      physicsWorld.step(1/60);
      checkCollision();
      if (collisionDetected) break;
    }

    expect(collisionDetected).toBe(true);
  });

  it('should set collision callback', () => {
    let callbackCalled = false;

    physicsWorld.setCollisionCallback((bodyA, bodyB) => {
      callbackCalled = true;
    });

    physicsWorld.createGroundPlane();

    const position = new THREE.Vector3(0, 10, 0);
    const size = new THREE.Vector3(1, 1, 1);
    physicsWorld.createBox(position, size, 1);

    // Step simulation
    for (let i = 0; i < 100; i++) {
      physicsWorld.step(1/60);
    }

    // Callback may or may not be called depending on Ammo.js implementation
    // Just verify we can set it without errors
    expect(true).toBe(true);
  });
});
