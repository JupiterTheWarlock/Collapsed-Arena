import * as THREE from 'three';
import { ScreenShake, ShakeIntensity } from './ScreenShake';
import { ParticleSystem } from './ParticleSystem';

/**
 * VisualEffects - Unified visual feedback manager
 *
 * Coordinates screen shake, particles, and other visual effects
 */
export class VisualEffects {
  private screenShake: ScreenShake;
  private particleSystem: ParticleSystem;
  private scene: any;

  constructor(scene: any) {
    this.scene = scene;
    this.screenShake = new ScreenShake();
    this.particleSystem = new ParticleSystem(scene);
  }

  /**
   * Trigger damage effect (screen shake + impact particles)
   * @param position - Damage position
   * @param damageAmount - Amount of damage (affects intensity)
   */
  triggerDamageEffect(position: THREE.Vector3, damageAmount: number): void {
    // Screen shake based on damage
    let shakeIntensity: ShakeIntensity = 'light';
    if (damageAmount >= 3) shakeIntensity = 'normal';
    if (damageAmount >= 5) shakeIntensity = 'heavy';
    if (damageAmount >= 8) shakeIntensity = 'extreme';

    this.screenShake.trigger(shakeIntensity);

    // Impact particles
    this.particleSystem.emitImpact(position, damageAmount);
  }

  /**
   * Emit movement trail particles
   * @param position - Current position
   * @param isFastFall - Whether fast-falling (stronger trail)
   */
  emitMovementTrail(position: THREE.Vector3, isFastFall: boolean): void {
    const trailType = isFastFall ? 'fastfall' : 'normal';
    this.particleSystem.emitTrail(position, trailType);

    // Fast-fall also triggers light screen shake
    if (isFastFall) {
      this.screenShake.trigger('light');
    }
  }

  /**
   * Emit cube drop burst effect
   * @param position - Drop position
   */
  emitCubeDropEffect(position: THREE.Vector3): void {
    this.particleSystem.emitCubeDrop(position);
  }

  /**
   * Emit absorption particle flow
   * @param from - Source position
   * @param to - Target position
   */
  emitAbsorptionEffect(from: THREE.Vector3, to: THREE.Vector3): void {
    this.particleSystem.emitAbsorption(from, to);
  }

  /**
   * Trigger kill effect (strong screen shake + burst particles)
   * @param position - Kill position
   */
  triggerKillEffect(position: THREE.Vector3): void {
    // Strong screen shake for kill
    this.screenShake.trigger('heavy');

    // Burst particles
    this.particleSystem.emitImpact(position, 15);
  }

  /**
   * Trigger death effect (extreme screen shake)
   * @param position - Death position
   */
  triggerDeathEffect(position: THREE.Vector3): void {
    // Extreme screen shake for death
    this.screenShake.trigger('extreme');

    // Large burst
    this.particleSystem.emitImpact(position, 20);
  }

  /**
   * Update all effect systems
   * @param deltaTime - Time since last frame (in seconds)
   */
  update(deltaTime: number): void {
    this.screenShake.update(deltaTime);
    this.particleSystem.update(deltaTime);
  }

  /**
   * Get screen shake system
   * @returns ScreenShake instance
   */
  getScreenShake(): ScreenShake {
    return this.screenShake;
  }

  /**
   * Get particle system
   * @returns ParticleSystem instance
   */
  getParticleSystem(): ParticleSystem {
    return this.particleSystem;
  }

  /**
   * Reset all effect systems
   */
  reset(): void {
    this.screenShake.reset();
    this.particleSystem.reset();
  }

  /**
   * Dispose of all effect systems
   */
  dispose(): void {
    this.screenShake.dispose();
    this.particleSystem.dispose();
  }
}
