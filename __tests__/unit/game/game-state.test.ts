import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '@/game/GameState';

describe('Game - GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  it('should initialize in MENU state', () => {
    expect(gameState.getCurrentState()).toBe('MENU');
  });

  it('should transition to PLAYING when startGame called', () => {
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');
  });

  it('should transition to GAME_OVER when triggerGameOver called', () => {
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');

    gameState.triggerGameOver();
    expect(gameState.getCurrentState()).toBe('GAME_OVER');
  });

  it('should transition back to MENU after game over timeout', () => {
    gameState.startGame();
    gameState.triggerGameOver();

    // Simulate game over timeout (2 seconds)
    gameState.update(2.5);
    expect(gameState.getCurrentState()).toBe('MENU');
  });

  it('should not allow startGame when already PLAYING', () => {
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');

    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');  // Still PLAYING
  });

  it('should provide state change callbacks', () => {
    let lastState = '';
    gameState.onStateChange((newState) => {
      lastState = newState;
    });

    gameState.startGame();
    expect(lastState).toBe('PLAYING');

    gameState.triggerGameOver();
    expect(lastState).toBe('GAME_OVER');
  });

  it('should check if in specific state', () => {
    expect(gameState.isInState('MENU')).toBe(true);
    expect(gameState.isInState('PLAYING')).toBe(false);

    gameState.startGame();
    expect(gameState.isInState('PLAYING')).toBe(true);
    expect(gameState.isInState('MENU')).toBe(false);
  });

  it('should reset state', () => {
    gameState.startGame();
    expect(gameState.getCurrentState()).toBe('PLAYING');

    gameState.reset();
    expect(gameState.getCurrentState()).toBe('MENU');
  });

  it('should track game time', () => {
    gameState.startGame();

    gameState.update(1.0);
    gameState.update(0.5);

    expect(gameState.getGameTime()).toBeCloseTo(1.5, 5);
  });

  it('should reset game time on new game', () => {
    gameState.startGame();
    gameState.update(5.0);
    expect(gameState.getGameTime()).toBeCloseTo(5.0, 5);

    gameState.triggerGameOver();
    gameState.startGame();
    expect(gameState.getGameTime()).toBe(0);
  });
});
