import { expect, beforeEach, afterEach, vi } from 'vitest';
import { setupCanvasMock } from './three-mocks';

// Setup canvas mock for Three.js
setupCanvasMock();

// Mock Web Speech API
global.window.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [])
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance API
global.performance.now = () => Date.now();
