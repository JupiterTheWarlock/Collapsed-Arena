import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';

// Mock document before importing SceneManager
const mockCanvas = {
  width: 800,
  height: 600,
  style: {},
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getContext: vi.fn(() => ({
    drawingBufferWidth: 800,
    drawingBufferHeight: 600
  }))
};

global.document = {
  createElement: vi.fn(() => mockCanvas),
  body: {}
} as any;

// Import after mocking
import { LightingManager } from '@/rendering/LightingManager';
import { SceneManager } from '@/rendering/SceneManager';

describe('Rendering Layer - LightingManager', () => {
  let lightingManager: LightingManager;
  let sceneManager: SceneManager;
  let scene: THREE.Scene;

  beforeEach(() => {
    sceneManager = new SceneManager();
    scene = sceneManager.getScene();
    lightingManager = new LightingManager(scene);
  });

  afterEach(() => {
    if (lightingManager) {
      lightingManager.dispose();
    }
    if (sceneManager) {
      sceneManager.dispose();
    }
  });

  it('should create ambient light for base illumination', () => {
    const lights = scene.children.filter(child => child instanceof THREE.AmbientLight);

    expect(lights.length).toBeGreaterThan(0);
    expect(lights[0]).toBeInstanceOf(THREE.AmbientLight);

    const ambientLight = lights[0] as THREE.AmbientLight;
    expect(ambientLight.intensity).toBeGreaterThan(0);
  });

  it('should create directional light as main light source', () => {
    const lights = scene.children.filter(child => child instanceof THREE.DirectionalLight);

    expect(lights.length).toBeGreaterThan(0);
    expect(lights[0]).toBeInstanceOf(THREE.DirectionalLight);

    const directionalLight = lights[0] as THREE.DirectionalLight;
    expect(directionalLight.intensity).toBeGreaterThan(0);
  });

  it('should configure directional light to cast shadows', () => {
    const lights = scene.children.filter(child => child instanceof THREE.DirectionalLight);

    expect(lights.length).toBeGreaterThan(0);

    const directionalLight = lights[0] as THREE.DirectionalLight;
    expect(directionalLight.castShadow).toBe(true);
  });

  it('should configure shadow camera with appropriate bounds', () => {
    const lights = scene.children.filter(child => child instanceof THREE.DirectionalLight);

    expect(lights.length).toBeGreaterThan(0);

    const directionalLight = lights[0] as THREE.DirectionalLight;
    const shadowCamera = directionalLight.shadow.camera;

    // Shadow camera should be configured for the game area
    expect(shadowCamera.left).toBeLessThan(0);
    expect(shadowCamera.right).toBeGreaterThan(0);
    expect(shadowCamera.top).toBeGreaterThan(0);
    expect(shadowCamera.bottom).toBeLessThan(0);
  });

  it('should set shadow map size for quality shadows', () => {
    const lights = scene.children.filter(child => child instanceof THREE.DirectionalLight);

    expect(lights.length).toBeGreaterThan(0);

    const directionalLight = lights[0] as THREE.DirectionalLight;
    const shadowMapSize = directionalLight.shadow.mapSize;

    // Shadow map should have reasonable resolution
    expect(shadowMapSize.width).toBeGreaterThanOrEqual(512);
    expect(shadowMapSize.height).toBeGreaterThanOrEqual(512);
  });
});
