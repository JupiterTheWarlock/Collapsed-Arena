import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameOverScreen } from '@/ui/GameOverScreen';

describe('UI - GameOverScreen', () => {
  let gameOverScreen: GameOverScreen;
  let mockContainer: any;

  beforeEach(() => {
    // Track display state (for hide() method)
    let displayState: string = 'none';

    mockContainer = {
      innerHTML: '',
      style: {},
      removeChild: vi.fn(),
      querySelector: vi.fn((selector: string) => {
        if (selector === '.game-over-screen' || selector === 'div') {
          return {
            get style() {
              return {
                get display() {
                  // Check innerHTML first (set by show())
                  const html = mockContainer.innerHTML;
                  if (html.includes('display: flex')) {
                    return 'flex';
                  }
                  if (html.includes('display: none')) {
                    return 'none';
                  }
                  // Otherwise return tracked state (set by hide())
                  return displayState;
                },
                set display(value: string) {
                  displayState = value;
                }
              };
            }
          };
        }
        return null;
      })
    };

    gameOverScreen = new GameOverScreen(mockContainer);
  });

  afterEach(() => {
    if (gameOverScreen) {
      gameOverScreen.dispose();
    }
  });

  it('should create game over screen UI', () => {
    expect(mockContainer.innerHTML).toContain('Game Over');
  });

  it('should be hidden initially', () => {
    expect(gameOverScreen.isVisible()).toBe(false);
    const screen = mockContainer.querySelector('.game-over-screen');
    expect(screen.style.display).toBe('none');
  });

  it('should show when displayed', () => {
    gameOverScreen.show(120.5); // 2 minutes 0.5 seconds
    expect(gameOverScreen.isVisible()).toBe(true);
    const screen = mockContainer.querySelector('.game-over-screen');
    expect(screen.style.display).toBe('flex');
  });

  it('should display survival time', () => {
    gameOverScreen.show(125.8); // 2 minutes 5.8 seconds
    expect(mockContainer.innerHTML).toContain('2:05');
  });

  it('should hide when hide called', () => {
    gameOverScreen.show(100);
    expect(gameOverScreen.isVisible()).toBe(true);

    gameOverScreen.hide();
    expect(gameOverScreen.isVisible()).toBe(false);
    const screen = mockContainer.querySelector('.game-over-screen');
    expect(screen.style.display).toBe('none');
  });

  it('should dispose properly', () => {
    gameOverScreen.dispose();
    // Should not throw
    expect(() => gameOverScreen.show(100)).not.toThrow();
  });

  it('should update survival time on each show', () => {
    gameOverScreen.show(60);
    expect(mockContainer.innerHTML).toContain('1:00');

    gameOverScreen.show(150);
    expect(mockContainer.innerHTML).toContain('2:30');
  });
});
