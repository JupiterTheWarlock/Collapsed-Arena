import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '@/audio/AudioManager';

describe('Audio - AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    // Mock window.Audio
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      volume: 1.0,
      currentTime: 0
    })) as any;

    audioManager = new AudioManager();
  });

  afterEach(() => {
    if (audioManager) {
      audioManager.dispose();
    }
  });

  it('should initialize with master volume', () => {
    expect(audioManager.getMasterVolume()).toBeCloseTo(1.0, 5);
  });

  it('should play jump sound', () => {
    expect(() => audioManager.playJump()).not.toThrow();
  });

  it('should play fast-fall sound', () => {
    expect(() => audioManager.playFastFall()).not.toThrow();
  });

  it('should play impact sound with intensity', () => {
    expect(() => audioManager.playImpact(5)).not.toThrow();
  });

  it('should play damage sound', () => {
    expect(() => audioManager.playDamage()).not.toThrow();
  });

  it('should play kill sound', () => {
    expect(() => audioManager.playKill()).not.toThrow();
  });

  it('should play death sound', () => {
    expect(() => audioManager.playDeath()).not.toThrow();
  });

  it('should play cube drop sound', () => {
    expect(() => audioManager.playCubeDrop()).not.toThrow();
  });

  it('should play absorption sound', () => {
    expect(() => audioManager.playAbsorption()).not.toThrow();
  });

  it('should set master volume', () => {
    audioManager.setMasterVolume(0.5);
    expect(audioManager.getMasterVolume()).toBeCloseTo(0.5, 5);
  });

  it('should clamp master volume between 0 and 1', () => {
    audioManager.setMasterVolume(1.5);
    expect(audioManager.getMasterVolume()).toBeCloseTo(1.0, 5);

    audioManager.setMasterVolume(-0.5);
    expect(audioManager.getMasterVolume()).toBeCloseTo(0.0, 5);
  });

  it('should mute all sounds', () => {
    audioManager.setMasterVolume(0.0);
    expect(audioManager.getMasterVolume()).toBeCloseTo(0.0, 5);
  });

  it('should handle multiple audio plays', () => {
    audioManager.playJump();
    audioManager.playFastFall();
    audioManager.playImpact(3);

    // Should not throw
    expect(audioManager.getMasterVolume()).toBeDefined();
  });
});
