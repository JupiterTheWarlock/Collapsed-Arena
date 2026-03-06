import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StartScreen } from '@/ui/StartScreen';

describe('UI - StartScreen', () => {
  let startScreen: StartScreen;
  let mockContainer: any;

  beforeEach(() => {
    // Mock screen element
    const mockScreen = {
      style: { display: 'flex' }
    };

    // Mock button element
    const mockButton = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: {},
      onclick: null as ((event: any) => void) | null
    };

    mockContainer = {
      innerHTML: '',
      style: {},
      removeChild: vi.fn(),
      querySelector: vi.fn((selector: string) => {
        if (selector === '.start-screen' || selector === 'div') {
          return mockScreen;
        }
        if (selector === '#start-button' || selector === 'button') {
          return mockButton;
        }
        return null;
      })
    };

    startScreen = new StartScreen(mockContainer);
  });

  afterEach(() => {
    if (startScreen) {
      startScreen.dispose();
    }
  });

  it('should create start screen UI', () => {
    expect(mockContainer.innerHTML).toContain('Collapsed Arena');
  });

  it('should have start button', () => {
    const button = mockContainer.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should show start button initially', () => {
    expect(startScreen.isVisible()).toBe(true);
  });

  it('should hide when game starts', () => {
    startScreen.hide();
    expect(startScreen.isVisible()).toBe(false);
    const screen = mockContainer.querySelector('.start-screen');
    expect(screen.style.display).toBe('none');
  });

  it('should show when displayed', () => {
    startScreen.hide();
    startScreen.show();
    expect(startScreen.isVisible()).toBe(true);
    const screen = mockContainer.querySelector('.start-screen');
    expect(screen.style.display).toBe('flex');
  });

  it('should trigger start callback on button click', () => {
    let started = false;
    startScreen.onStart(() => {
      started = true;
    });

    // Simulate button click
    const button = mockContainer.querySelector('button');
    button.onclick(null);

    expect(started).toBe(true);
  });

  it('should dispose properly', () => {
    startScreen.dispose();
    // Should not throw
    expect(() => startScreen.show()).not.toThrow();
  });
});
