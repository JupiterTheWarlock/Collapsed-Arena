import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualEffects } from '@/rendering/VisualEffects';
import { ScreenShake } from '@/rendering/ScreenShake';
import { ParticleSystem } from '@/rendering/ParticleSystem';
import * as THREE from 'three';

describe('Visual Effects - VisualEffects', () => {
  let visualEffects: VisualEffects;
  let mockScene: any;

  beforeEach(() => {
    mockScene = {
      add: vi.fn(),
      remove: vi.fn()
    };

    visualEffects = new VisualEffects(mockScene);
  });

  afterEach(() => {
    if (visualEffects) {
      visualEffects.dispose();
    }
  });

  it('should initialize with screen shake and particle system', () => {
    expect(visualEffects.getScreenShake()).toBeInstanceOf(ScreenShake);
    expect(visualEffects.getParticleSystem()).toBeInstanceOf(ParticleSystem);
  });

  it('should trigger screen shake on damage', () => {
    visualEffects.triggerDamageEffect(new THREE.Vector3(0, 0, 0), 5);

    const screenShake = visualEffects.getScreenShake();
    expect(screenShake.isActive()).toBe(true);
  });

  it('should trigger impact particles on damage', () => {
    visualEffects.triggerDamageEffect(new THREE.Vector3(0, 0, 0), 10);

    const particleSystem = visualEffects.getParticleSystem();
    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit trail particles for movement', () => {
    visualEffects.emitMovementTrail(new THREE.Vector3(0, 0, 0), false);

    const particleSystem = visualEffects.getParticleSystem();
    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit stronger trail for fast-fall', () => {
    visualEffects.emitMovementTrail(new THREE.Vector3(0, 0, 0), false);
    const normalCount = visualEffects.getParticleSystem().getActiveParticleCount();

    visualEffects.reset();
    visualEffects.emitMovementTrail(new THREE.Vector3(0, 0, 0), true);
    const fastFallCount = visualEffects.getParticleSystem().getActiveParticleCount();

    expect(fastFallCount).toBeGreaterThan(normalCount);
  });

  it('should emit cube drop burst effect', () => {
    visualEffects.emitCubeDropEffect(new THREE.Vector3(0, 5, 0));

    const particleSystem = visualEffects.getParticleSystem();
    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should emit absorption particle flow', () => {
    const from = new THREE.Vector3(0, 0, 0);
    const to = new THREE.Vector3(1, 1, 1);
    visualEffects.emitAbsorptionEffect(from, to);

    const particleSystem = visualEffects.getParticleSystem();
    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should trigger kill effect with strong screen shake', () => {
    visualEffects.triggerKillEffect(new THREE.Vector3(0, 0, 0));

    const screenShake = visualEffects.getScreenShake();
    const particleSystem = visualEffects.getParticleSystem();

    // Should have both screen shake and particles
    expect(screenShake.isActive()).toBe(true);
    expect(particleSystem.getActiveParticleCount()).toBeGreaterThan(0);
  });

  it('should update all effect systems', () => {
    visualEffects.emitMovementTrail(new THREE.Vector3(0, 0, 0), false);
    visualEffects.triggerDamageEffect(new THREE.Vector3(0, 0, 0), 5);

    // Should not throw
    expect(() => visualEffects.update(0.1)).not.toThrow();
  });

  it('should reset all effect systems', () => {
    visualEffects.emitMovementTrail(new THREE.Vector3(0, 0, 0), false);
    visualEffects.triggerDamageEffect(new THREE.Vector3(0, 0, 0), 5);

    visualEffects.reset();

    const screenShake = visualEffects.getScreenShake();
    const particleSystem = visualEffects.getParticleSystem();

    expect(screenShake.isActive()).toBe(false);
    expect(particleSystem.getActiveParticleCount()).toBe(0);
  });
});
