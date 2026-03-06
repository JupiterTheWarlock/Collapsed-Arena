import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScreenShake } from '@/rendering/ScreenShake';

describe('Visual Effects - ScreenShake', () => {
  let screenShake: ScreenShake;

  beforeEach(() => {
    screenShake = new ScreenShake();
  });

  afterEach(() => {
    if (screenShake) {
      screenShake.dispose();
    }
  });

  it('should initialize with no shake', () => {
    const offset = screenShake.getOffset();
    expect(offset.x).toBeCloseTo(0.0, 5);
    expect(offset.y).toBeCloseTo(0.0, 5);
  });

  it('should trigger shake with intensity level', () => {
    screenShake.trigger('light');
    expect(screenShake.isActive()).toBe(true);
  });

  it('should have different intensity levels', () => {
    const lightOffset = screenShake.getIntensity('light');
    const normalOffset = screenShake.getIntensity('normal');
    const heavyOffset = screenShake.getIntensity('heavy');
    const extremeOffset = screenShake.getIntensity('extreme');

    expect(lightOffset).toBeLessThan(normalOffset);
    expect(normalOffset).toBeLessThan(heavyOffset);
    expect(heavyOffset).toBeLessThan(extremeOffset);
  });

  it('should decay shake over time', () => {
    screenShake.trigger('normal');

    // Get first offset (need to call update first to generate offset)
    screenShake.update(0.01);
    const offset1 = screenShake.getOffset();

    // Update more time
    screenShake.update(0.1);
    const offset2 = screenShake.getOffset();

    // Offset should decrease after more time passes (due to decay)
    // Run multiple times to average out randomness
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < 10; i++) {
      screenShake.reset();
      screenShake.trigger('normal');

      screenShake.update(0.01);
      const o1 = screenShake.getOffset();
      magnitude1 += Math.abs(o1.x) + Math.abs(o1.y);

      screenShake.update(0.2);
      const o2 = screenShake.getOffset();
      magnitude2 += Math.abs(o2.x) + Math.abs(o2.y);
    }

    expect(magnitude2).toBeLessThan(magnitude1);
  });

  it('should stop shaking after duration', () => {
    screenShake.trigger('light');

    // Update past shake duration (light = 0.3s)
    screenShake.update(0.4);

    expect(screenShake.isActive()).toBe(false);
    expect(screenShake.getOffset().x).toBeCloseTo(0.0, 5);
    expect(screenShake.getOffset().y).toBeCloseTo(0.0, 5);
  });

  it('should support all shake intensity levels', () => {
    const levels = ['none', 'light', 'normal', 'heavy', 'extreme'];

    for (const level of levels) {
      expect(() => screenShake.trigger(level)).not.toThrow();
    }
  });

  it('should handle multiple trigger calls', () => {
    screenShake.trigger('light');
    screenShake.trigger('normal');

    expect(screenShake.isActive()).toBe(true);
  });

  it('should reset shake state', () => {
    screenShake.trigger('extreme');
    expect(screenShake.isActive()).toBe(true);

    screenShake.reset();
    expect(screenShake.isActive()).toBe(false);
  });
});
