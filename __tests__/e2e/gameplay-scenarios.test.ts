import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '@/game/GameLoop';
import { GameState } from '@/game/GameState';
import { Entity } from '@/core/Entity';

describe('E2E - Gameplay Scenarios', () => {
  let gameLoop: GameLoop;
  let gameState: GameState;
  let player: Entity;

  beforeEach(() => {
    // Setup minimal game environment
    gameLoop = new GameLoop(60);
    gameState = new GameState();

    // Create player entity
    player = new Entity('player', 'player');
  });

  afterEach(() => {
    gameLoop.stop();
    gameState.dispose();
  });

  it('should complete full state transition loop', () => {
    // Initial state: MENU
    expect(gameState.getCurrentState()).toBe('MENU');

    // Start game
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');

    // Trigger game over
    gameState.triggerGameOver();
    expect(gameState.getCurrentState()).toBe('GAME_OVER');

    // Update past timeout (2 seconds)
    gameState.update(2.5);
    expect(gameState.getCurrentState()).toBe('MENU');
  });

  it('should track game time during play session', () => {
    gameState.reset();
    gameState.startGame();

    // Simulate 5 seconds of gameplay
    gameState.update(2.0);
    gameState.update(3.0);

    expect(gameState.getGameTime()).toBeCloseTo(5.0, 5);
  });

  it('should reset game time on new game', () => {
    gameState.startGame();
    gameState.update(10.0);
    expect(gameState.getGameTime()).toBeCloseTo(10.0, 5);

    gameState.triggerGameOver();
    gameState.startGame();
    expect(gameState.getGameTime()).toBe(0);
  });

  it('should not transition to PLAYING if already PLAYING', () => {
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');

    // Try to start again
    gameState.startGame();
    expect(gameState.getGameTime()).toBe(0); // Time should not reset
  });

  it('should not transition to GAME_OVER if not PLAYING', () => {
    gameState.reset();
    expect(gameState.getCurrentState()).toBe('MENU');

    // Try to trigger game over from menu
    gameState.triggerGameOver();
    expect(gameState.getCurrentState()).toBe('MENU');
  });

  it('should handle rapid state changes correctly', () => {
    gameState.reset();

    // Rapid transitions
    gameState.startGame();
    gameState.triggerGameOver();
    gameState.update(0.1); // Not enough to return to menu
    expect(gameState.getCurrentState()).toBe('GAME_OVER');

    gameState.update(2.0); // Now returns to menu
    expect(gameState.getCurrentState()).toBe('MENU');

    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');
  });

  it('should execute game loop without errors', () => {
    gameLoop.start();

    // Let loop run briefly
    setTimeout(() => {
      gameLoop.stop();
    }, 100);

    // Should not throw
    expect(() => {
      gameLoop.start();
      gameLoop.stop();
    }).not.toThrow();
  });

  it('should handle state change callbacks', () => {
    let lastState = '';
    const states: string[] = [];

    gameState.onStateChange((newState) => {
      lastState = newState;
      states.push(newState);
    });

    gameState.reset();
    states.length = 0; // Clear array

    gameState.startGame();
    expect(lastState).toBe('PLAYING');
    expect(states).toContain('PLAYING');

    gameState.triggerGameOver();
    expect(lastState).toBe('GAME_OVER');
    expect(states).toContain('GAME_OVER');

    gameState.update(2.5);
    expect(lastState).toBe('MENU');
    expect(states).toContain('MENU');
  });

  it('should handle multiple state change listeners', () => {
    let count1 = 0;
    let count2 = 0;

    gameState.onStateChange(() => count1++);
    gameState.onStateChange(() => count2++);

    gameState.reset();
    count1 = 0;
    count2 = 0;

    gameState.startGame();
    expect(count1).toBe(1);
    expect(count2).toBe(1);

    gameState.triggerGameOver();
    expect(count1).toBe(2);
    expect(count2).toBe(2);
  });

  it('should handle callback errors gracefully', () => {
    // Add callbacks that throw errors
    gameState.onStateChange(() => {
      throw new Error('Test error');
    });

    let callbackExecuted = false;
    gameState.onStateChange(() => {
      callbackExecuted = true;
    });

    // Should not throw despite error in first callback
    expect(() => {
      gameState.startGame();
    }).not.toThrow();

    // Second callback should still execute
    expect(callbackExecuted).toBe(true);
  });

  it('should survive for minimum gameplay duration', () => {
    gameState.reset();
    gameState.startGame();

    // Simulate 60 seconds of survival
    for (let i = 0; i < 60; i++) {
      gameState.update(1.0);
    }

    expect(gameState.getGameTime()).toBeCloseTo(60.0, 5);
    expect(gameState.getCurrentState()).toBe('PLAYING');
  });

  it('should auto-return to menu after game over', () => {
    gameState.reset();
    gameState.startGame();
    gameState.triggerGameOver();

    expect(gameState.getCurrentState()).toBe('GAME_OVER');

    // Update 1 second - still in GAME_OVER
    gameState.update(1.0);
    expect(gameState.getCurrentState()).toBe('GAME_OVER');

    // Update another 1.1 seconds - total 2.1s, should return to menu
    gameState.update(1.1);
    expect(gameState.getCurrentState()).toBe('MENU');
  });
});
