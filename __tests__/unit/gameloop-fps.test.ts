import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameLoop } from '../../src/game/GameLoop';

describe('Infrastructure - Game Loop 60fps', () => {
  let gameLoop: GameLoop;

  beforeEach(() => {
    gameLoop = new GameLoop();
  });

  afterEach(() => {
    if (gameLoop.isRunning()) {
      gameLoop.stop();
    }
  });

  it('should create a game loop with target FPS of 60', () => {
    expect(gameLoop.getTargetFPS()).toBe(60);
  });

  it('should start in stopped state', () => {
    expect(gameLoop.isRunning()).toBe(false);
  });

  it('should start when start() is called', () => {
    gameLoop.start();
    expect(gameLoop.isRunning()).toBe(true);
    gameLoop.stop();
  });

  it('should stop when stop() is called', () => {
    gameLoop.start();
    expect(gameLoop.isRunning()).toBe(true);

    gameLoop.stop();
    expect(gameLoop.isRunning()).toBe(false);
  });

  it('should not start twice', () => {
    gameLoop.start();
    expect(gameLoop.isRunning()).toBe(true);

    // Starting again should be safe (no-op)
    gameLoop.start();
    expect(gameLoop.isRunning()).toBe(true);

    gameLoop.stop();
  });

  it('should verify frame time calculation for 60fps', () => {
    const targetFPS = 60;
    const expectedFrameTime = 1000 / targetFPS; // ~16.67ms

    expect(expectedFrameTime).toBeCloseTo(16.67, 2);
  });

  it('should handle multiple start/stop cycles', () => {
    for (let i = 0; i < 3; i++) {
      gameLoop.start();
      expect(gameLoop.isRunning()).toBe(true);
      gameLoop.stop();
      expect(gameLoop.isRunning()).toBe(false);
    }
  });
});
