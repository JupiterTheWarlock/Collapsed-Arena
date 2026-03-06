/**
 * ScreenShake - Camera shake effect
 *
 * Provides different intensity levels for screen shake on damage, kills, etc.
 */

export type ShakeIntensity = 'none' | 'light' | 'normal' | 'heavy' | 'extreme';

export interface ShakeOffset {
  x: number;
  y: number;
}

export class ScreenShake {
  private currentIntensity: number = 0.0;
  private currentDuration: number = 0.0;
  private elapsedTime: number = 0.0;
  private currentOffset: ShakeOffset = { x: 0.0, y: 0.0 };

  private readonly intensityLevels: Record<ShakeIntensity, number> = {
    none: 0.0,
    light: 0.3,
    normal: 0.6,
    heavy: 1.0,
    extreme: 1.5
  };

  private readonly durationLevels: Record<ShakeIntensity, number> = {
    none: 0.0,
    light: 0.3,
    normal: 0.5,
    heavy: 0.7,
    extreme: 1.0
  };

  /**
   * Update shake state
   * @param deltaTime - Time since last frame (in seconds)
   */
  update(deltaTime: number): void {
    if (!this.isActive()) {
      this.currentOffset = { x: 0.0, y: 0.0 };
      return;
    }

    this.elapsedTime += deltaTime;

    // Calculate decay factor (1.0 at start, 0.0 at end)
    const decay = 1.0 - (this.elapsedTime / this.currentDuration);
    const clampedDecay = Math.max(0.0, decay);

    // Generate random offset with decay
    const angle = Math.random() * Math.PI * 2;
    const magnitude = this.currentIntensity * clampedDecay;

    this.currentOffset = {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude
    };

    // Stop if duration exceeded
    if (this.elapsedTime >= this.currentDuration) {
      this.currentIntensity = 0.0;
      this.currentDuration = 0.0;
      this.elapsedTime = 0.0;
      this.currentOffset = { x: 0.0, y: 0.0 };
    }
  }

  /**
   * Trigger screen shake with specific intensity
   * @param intensity - Shake intensity level
   */
  trigger(intensity: ShakeIntensity): void {
    const intensityValue = this.intensityLevels[intensity];
    const durationValue = this.durationLevels[intensity];

    // Use maximum of current and new intensity
    this.currentIntensity = Math.max(this.currentIntensity, intensityValue);
    this.currentDuration = Math.max(this.currentDuration, durationValue);
    this.elapsedTime = 0.0;
  }

  /**
   * Get current shake offset
   * @returns Offset {x, y}
   */
  getOffset(): ShakeOffset {
    return { ...this.currentOffset };
  }

  /**
   * Check if shake is active
   * @returns true if shaking
   */
  isActive(): boolean {
    return this.currentIntensity > 0.0 && this.elapsedTime < this.currentDuration;
  }

  /**
   * Get intensity value for level
   * @param intensity - Shake intensity level
   * @returns Intensity value
   */
  getIntensity(intensity: ShakeIntensity): number {
    return this.intensityLevels[intensity];
  }

  /**
   * Reset shake state
   */
  reset(): void {
    this.currentIntensity = 0.0;
    this.currentDuration = 0.0;
    this.elapsedTime = 0.0;
    this.currentOffset = { x: 0.0, y: 0.0 };
  }

  /**
   * Dispose of screen shake resources
   */
  dispose(): void {
    this.reset();
  }
}
