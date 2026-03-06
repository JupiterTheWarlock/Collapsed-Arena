import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ParticleSystem } from '@/rendering/ParticleSystem';
import * as THREE from 'three';

describe('Visual Effects - ParticleSystem', () => {
  let particleSystem: ParticleSystem;
  let mockScene: any;

  beforeEach(() => {
    // Create mock scene
    mockScene = {
      add: vi.fn(),
      remove: vi.fn()
    };

    particleSystem = new ParticleSystem(mockScene);
  });

  afterEach(() => {
    if (particleSystem) {
      particleSystem.dispose();
    }
  });

  it('should initialize with empty particle list', () => {
    expect(particleSystem.getActiveParticleCount()).toBe(0);
  });

  it('should emit trail particles', () => {
    const position = new THREE.Vector3(0, 0, 0);
    particleSystem.emitTrail(position, 'normal');

    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit fast-fall trail with more particles', () => {
    const position = new THREE.Vector3(0, 0, 0);

    particleSystem.emitTrail(position, 'normal');
    const normalCount = particleSystem.getActiveParticleCount();

    particleSystem.reset();
    particleSystem.emitTrail(position, 'fastfall');
    const fastFallCount = particleSystem.getActiveParticleCount();

    expect(fastFallCount).toBeGreaterThan(normalCount);
  });

  it('should emit impact particles on collision', () => {
    const position = new THREE.Vector3(5, 0, 5);
    particleSystem.emitImpact(position, 10);

    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit cube drop burst particles', () => {
    const position = new THREE.Vector3(0, 5, 0);
    particleSystem.emitCubeDrop(position);

    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit absorption particles', () => {
    const from = new THREE.Vector3(0, 0, 0);
    const to = new THREE.Vector3(1, 1, 1);
    particleSystem.emitAbsorption(from, to);

    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should update and remove expired particles', () => {
    const position = new THREE.Vector3(0, 0, 0);
    particleSystem.emitTrail(position, 'normal');

    const initialCount = particleSystem.getActiveParticleCount();

    // Update past particle lifetime (trail particles live 1 second)
    particleSystem.update(1.1);

    const finalCount = particleSystem.getActiveParticleCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  it('should clear all particles on reset', () => {
    const position = new THREE.Vector3(0, 0, 0);
    particleSystem.emitTrail(position, 'normal');
    particleSystem.emitImpact(position, 5);

    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);

    particleSystem.reset();
    expect(particleSystem.getActiveParticleCount()).toBe(0);
  });

  it('should limit maximum particle count', () => {
    const position = new THREE.Vector3(0, 0, 0);

    // Emit many particles to exceed max
    for (let i = 0; i < 1000; i++) {
      particleSystem.emitTrail(position, 'fastfall');
    }

    // Should be capped at max (e.g., 500)
    expect(particleSystem.getActiveParticleCount()).toBeLessThanOrEqual(500);
  });
});
