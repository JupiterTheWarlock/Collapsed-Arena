import { GameLoop } from './game/GameLoop';
import { GameState } from './game/GameState';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { LightingManager } from './rendering/LightingManager';
import { getCameraConfig } from './config/config-loader';
import * as THREE from 'three';

console.log('Collapsed Arena - Initializing...');

/**
 * Main game initialization
 */
async function initGame() {
  // Get canvas element
  const appContainer = document.getElementById('app') as HTMLElement;
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  // Initialize game state
  const gameState = new GameState();

  // Initialize rendering
  const sceneManager = new SceneManager();

  // Create UI layers to avoid DOM overwrites between screens
  appContainer.style.position = 'relative';
  const uiRoot = document.createElement('div');
  uiRoot.style.position = 'absolute';
  uiRoot.style.top = '0';
  uiRoot.style.left = '0';
  uiRoot.style.width = '100%';
  uiRoot.style.height = '100%';

  const startScreenContainer = document.createElement('div');
  startScreenContainer.style.position = 'absolute';
  startScreenContainer.style.top = '0';
  startScreenContainer.style.left = '0';
  startScreenContainer.style.width = '100%';
  startScreenContainer.style.height = '100%';
  startScreenContainer.style.pointerEvents = 'auto';

  const gameOverScreenContainer = document.createElement('div');
  gameOverScreenContainer.style.position = 'absolute';
  gameOverScreenContainer.style.top = '0';
  gameOverScreenContainer.style.left = '0';
  gameOverScreenContainer.style.width = '100%';
  gameOverScreenContainer.style.height = '100%';
  gameOverScreenContainer.style.pointerEvents = 'none';

  uiRoot.appendChild(startScreenContainer);
  uiRoot.appendChild(gameOverScreenContainer);

  // Add canvas to DOM
  const canvas = sceneManager.getCanvas();
  if (canvas) {
    appContainer.appendChild(canvas);
  }
  appContainer.appendChild(uiRoot);

  // Get camera config for CameraController
  const cameraConfig = getCameraConfig();

  const cameraController = new CameraController(sceneManager.getCamera(), cameraConfig);
  new LightingManager(sceneManager.getScene());

  // Create a simple player target for camera (placeholder)
  const playerTarget = new THREE.Object3D();
  playerTarget.position.set(0, 0, 0);
  sceneManager.getScene().add(playerTarget);

  // Add visible player placeholder cube to indicate game has started
  const playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x5bc0ff })
  );
  playerMesh.position.set(0, 0.5, 0);
  sceneManager.getScene().add(playerMesh);

  // Add a simple ground plane
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  sceneManager.getScene().add(ground);

  // Initialize UI
  const startScreen = new StartScreen(startScreenContainer);
  const gameOverScreen = new GameOverScreen(gameOverScreenContainer);

  // Initialize game loop
  const gameLoop = new GameLoop();

  // Register state change handlers
  gameState.onStateChange((newState) => {
    console.log('State changed:', newState);

    switch (newState) {
      case 'MENU':
        startScreen.show();
        gameOverScreen.hide();
        startScreenContainer.style.pointerEvents = 'auto';
        gameOverScreenContainer.style.pointerEvents = 'none';
        break;
      case 'PLAYING':
        startScreen.hide();
        gameOverScreen.hide();
        startScreenContainer.style.pointerEvents = 'none';
        gameOverScreenContainer.style.pointerEvents = 'none';
        break;
      case 'GAME_OVER':
        const survivalTime = gameState.getGameTime();
        gameOverScreen.show(survivalTime);
        startScreenContainer.style.pointerEvents = 'none';
        gameOverScreenContainer.style.pointerEvents = 'auto';
        break;
    }
  });

  // Start screen handler
  startScreen.onStart(() => {
    console.log('Starting game...');
    gameState.startGame();
    gameLoop.start();
  });

  // Game loop update
  gameLoop.onUpdate((deltaTime: number) => {
    // Update game state
    gameState.update(deltaTime);

    // Update camera to follow player target
    cameraController.update(deltaTime, playerTarget);

    // Move player in a circle for demonstration
    if (gameState.isInState('PLAYING')) {
      const time = gameState.getGameTime();
      playerTarget.position.x = Math.sin(time) * 3;
      playerTarget.position.z = Math.cos(time) * 3;
    }
    playerMesh.position.x = playerTarget.position.x;
    playerMesh.position.z = playerTarget.position.z;

    // Render scene
    sceneManager.render();

    // Check for game over condition (placeholder: after 30 seconds)
    if (gameState.isInState('PLAYING') && gameState.getGameTime() >= 30) {
      gameState.triggerGameOver();
      gameLoop.stop();
    }
  });

  // Initial state
  console.log('Game initialized. Waiting for player to start...');

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    gameLoop.stop();
    gameState.dispose();
    sceneManager.dispose();
  });
}

// Start the game
initGame().catch(console.error);
