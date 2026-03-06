import { GameLoop } from './game/GameLoop';
import { GameState } from './game/GameState';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { LightingManager } from './rendering/LightingManager';
import { EntityManager } from './core/EntityManager';
import { Entity } from './core/Entity';
import { InputManager } from './input/InputManager';
import { MovementSystem } from './systems/MovementSystem';
import { CombatSystem } from './systems/CombatSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import {
  PlayerControlComponent,
  MovementComponent,
  PhysicsComponent,
  CubeClusterComponent,
  CombatComponent,
  AbsorptionComponent
} from './components';
import { getCameraConfig, getPlayerConfig } from './config/config-loader';
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

  // Initialize entity manager
  const entityManager = new EntityManager();

  // Initialize input manager (will be activated when game starts)
  const canvas = sceneManager.getCanvas();
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }
  const inputManager = new InputManager(canvas);

  // Initialize game systems
  const movementSystem = new MovementSystem();
  const combatSystem = new CombatSystem();
  const spawnSystem = new SpawnSystem();
  const collisionSystem = new CollisionSystem(combatSystem);
  const particleSystem = new ParticleSystem(sceneManager.getScene());

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
  appContainer.appendChild(canvas);
  appContainer.appendChild(uiRoot);

  // Get camera config for CameraController
  const cameraConfig = getCameraConfig();

  const cameraController = new CameraController(sceneManager.getCamera(), cameraConfig);
  new LightingManager(sceneManager.getScene());

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

  // Player entity (will be created when game starts)
  let playerEntity: Entity | null = null;
  let playerMesh: THREE.Mesh | null = null;

  // Register state change handlers
  gameState.onStateChange((newState) => {
    console.log('State changed:', newState);

    switch (newState) {
      case 'MENU':
        startScreen.show();
        gameOverScreen.hide();
        startScreenContainer.style.pointerEvents = 'auto';
        gameOverScreenContainer.style.pointerEvents = 'none';

        // Release pointer lock when returning to menu
        inputManager.exitPointerLock();

        // Clear entities
        entityManager.clear();
        playerEntity = null;
        if (playerMesh) {
          sceneManager.getScene().remove(playerMesh);
          playerMesh = null;
        }

        // Stop spawning
        spawnSystem.stopSpawning();
        break;

      case 'PLAYING':
        startScreen.hide();
        gameOverScreen.hide();
        startScreenContainer.style.pointerEvents = 'none';
        gameOverScreenContainer.style.pointerEvents = 'none';

        // Request pointer lock for mouse control
        inputManager.requestPointerLock().catch((err) => {
          console.error('Failed to acquire pointer lock:', err);
        });

        // Create player entity
        createPlayerEntity();

        // Start spawning enemies
        spawnSystem.startSpawning();
        break;

      case 'GAME_OVER':
        const survivalTime = gameState.getGameTime();
        gameOverScreen.show(survivalTime);
        startScreenContainer.style.pointerEvents = 'none';
        gameOverScreenContainer.style.pointerEvents = 'auto';

        // Release pointer lock on game over
        inputManager.exitPointerLock();

        // Stop spawning
        spawnSystem.stopSpawning();
        break;
    }
  });

  /**
   * Create the player entity with all required components
   */
  function createPlayerEntity() {
    const playerConfig = getPlayerConfig();

    // Create player entity
    playerEntity = entityManager.createEntity('player');

    // Add required components
    playerEntity.addComponent(new PlayerControlComponent(0)); // Initial direction: 0 radians
    playerEntity.addComponent(new MovementComponent(
      playerConfig.rollSpeed,
      playerConfig.jumpForce,
      playerConfig.fastFallSpeed,
      true // isGrounded
    ));
    playerEntity.addComponent(new PhysicsComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    playerEntity.addComponent(new CubeClusterComponent(playerConfig.initialCubes, 1.0)); // Start with 1 cube
    playerEntity.addComponent(new CombatComponent(playerConfig.initialCubes, playerConfig.initialCubes, 0, false)); // Health: 1, Max: 1
    playerEntity.addComponent(new AbsorptionComponent(0.0, 1.0)); // Absorption buffer

    // Create visual representation
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x5bc0ff });
    playerMesh = new THREE.Mesh(geometry, material);
    playerMesh.position.set(0, 0.5, 0);

    sceneManager.getScene().add(playerMesh);

    console.log('Player entity created with all components');
  }

  // Enemy meshes map (entity ID -> mesh)
  const enemyMeshes = new Map<string, THREE.Mesh>();

  /**
   * Simple physics simulation - applies velocity to position
   */
  function updatePhysics(deltaTime: number, entities: Entity[]) {
    const gravity = -20; // Gravity force
    const groundY = -1; // Ground level
    const groundThreshold = 0.1; // Allow small floating

    for (const entity of entities) {
      if (!entity.isActive()) continue;

      const physics = entity.getComponent('PhysicsComponent') as PhysicsComponent;
      const movement = entity.getComponent('MovementComponent') as MovementComponent;

      if (!physics) continue;

      // Get current position
      const pos = entity.getPosition();

      // Store previous position for rotation calculation
      const prevX = pos.x;
      const prevZ = pos.z;

      // Apply gravity if in air
      if (movement && !movement.isGrounded) {
        physics.velocity.y += gravity * deltaTime;
      }

      // Apply velocity to position
      pos.x += physics.velocity.x * deltaTime;
      pos.y += physics.velocity.y * deltaTime;
      pos.z += physics.velocity.z * deltaTime;

      // Ground collision (with threshold for floating)
      if (pos.y <= groundY + groundThreshold) {
        pos.y = groundY;
        physics.velocity.y = 0;

        if (movement) {
          movement.isGrounded = true;
        }
      } else {
        // Entity is in air
        if (movement) {
          movement.isGrounded = false;
        }
      }

      // Apply damping/friction (only when grounded for less friction)
      if (movement && movement.isGrounded) {
        physics.velocity.x *= 0.98; // Less friction on ground
        physics.velocity.z *= 0.98;
      } else {
        physics.velocity.x *= 0.95; // More friction in air
        physics.velocity.z *= 0.95;
      }

      // Update entity position
      entity.setPosition(pos);

      // Calculate rolling rotation for player mesh
      if (entity.getType() === 'player' && (Math.abs(pos.x - prevX) > 0.001 || Math.abs(pos.z - prevZ) > 0.001)) {
        // Calculate movement direction and distance
        const dx = pos.x - prevX;
        const dz = pos.z - prevZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Calculate rotation axis (perpendicular to movement direction)
        // If moving in +X direction, rotate around +Z axis
        // If moving in +Z direction, rotate around -X axis
        const axisX = -dz / distance; // Perpendicular to movement
        const axisZ = dx / distance;

        // Calculate rotation angle (for a 1x1x1 cube, circumference = π * diameter = π)
        // Rolling distance = angle * radius, so angle = distance / radius
        // For a 1x1x1 cube, radius = 0.5
        const rotationAngle = distance / 0.5; // radians

        // Create rotation quaternion
        const rotationAxis = new THREE.Vector3(axisX, 0, axisZ).normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(rotationAxis, rotationAngle);

        // Apply rotation to player mesh
        if (playerMesh) {
          playerMesh.quaternion.multiplyQuaternions(quaternion, playerMesh.quaternion);
        }
      }
    }
  }

  /**
   * Update visual representations for all entities
   */
  function updateEntityVisuals(entities: Entity[]) {
    // Update player mesh
    if (playerEntity && playerMesh) {
      const playerPos = playerEntity.getPosition();
      playerMesh.position.set(playerPos.x, playerPos.y + 0.5, playerPos.z);
    }

    // Update enemy meshes
    for (const entity of entities) {
      if (entity.getType() === 'enemy') {
        const enemyPos = entity.getPosition();
        let mesh = enemyMeshes.get(entity.getId());

        if (!mesh) {
          // Create mesh for new enemy
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ color: 0xff4444 });
          mesh = new THREE.Mesh(geometry, material);
          sceneManager.getScene().add(mesh);
          enemyMeshes.set(entity.getId(), mesh);
        }

        // Update mesh position
        mesh.position.set(enemyPos.x, enemyPos.y + 0.5, enemyPos.z);

        // Check if enemy is dead
        const combat = entity.getComponent('CombatComponent') as CombatComponent;
        if (combat && combat.isDead) {
          sceneManager.getScene().remove(mesh);
          enemyMeshes.delete(entity.getId());
          entityManager.destroyEntity(entity.getId());
        }
      }
    }
  }

  // Start screen handler
  startScreen.onStart(() => {
    console.log('Starting game...');
    gameState.startGame();
    gameLoop.start();
  });

  // Game loop update
  gameLoop.onUpdate((deltaTime: number) => {
    // Update input manager
    inputManager.update();

    // Update game state
    gameState.update(deltaTime);

    // Only update game systems when playing
    if (gameState.isInState('PLAYING')) {
      const allEntities = entityManager.getAllEntities();

      // Get player direction and camera pitch from input manager
      const playerYaw = inputManager.getPlayerYaw();
      const cameraPitch = inputManager.getCameraPitch();

      // Update player movement direction
      movementSystem.setDirection(playerYaw);

      // Check for player input
      if (inputManager.consumeLeftClick()) {
        if (playerEntity) {
          const movement = playerEntity.getComponent('MovementComponent') as MovementComponent;
          if (movement) {
            if (movement.isGrounded) {
              // Jump
              movementSystem.triggerJump();
            } else {
              // Fast-fall
              movementSystem.triggerFastFall();
            }
          }
        }
      }

      // Update all game systems
      movementSystem.update(deltaTime, allEntities);
      collisionSystem.update(deltaTime, allEntities); // Collision detection
      combatSystem.update(deltaTime, allEntities);
      spawnSystem.update(deltaTime, allEntities);

      // Apply physics simulation
      updatePhysics(deltaTime, allEntities);

      // Update particle effects for player
      if (playerEntity) {
        const playerPhysics = playerEntity.getComponent('PhysicsComponent') as PhysicsComponent;
        const playerMovement = playerEntity.getComponent('MovementComponent') as MovementComponent;
        if (playerPhysics && playerMovement) {
          const playerPos = new THREE.Vector3(
            playerEntity.getPosition().x,
            playerEntity.getPosition().y,
            playerEntity.getPosition().z
          );
          const playerVel = new THREE.Vector3(
            playerPhysics.velocity.x,
            playerPhysics.velocity.y,
            playerPhysics.velocity.z
          );
          particleSystem.update(deltaTime, playerPos, playerVel, playerMovement.isGrounded);
        }
      }

      // Update visual representations
      updateEntityVisuals(allEntities);

      // Update camera to follow player
      if (playerEntity) {
        cameraController.update(deltaTime, playerEntity as any, playerYaw, cameraPitch);
      }
    }

    // Render scene
    sceneManager.render();
  });

  // Initial state
  console.log('Game initialized. Waiting for player to start...');

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    gameLoop.stop();
    gameState.dispose();
    sceneManager.dispose();
    entityManager.dispose();
    inputManager.dispose();
    collisionSystem.dispose();
    particleSystem.dispose();
  });
}

// Start the game
initGame().catch(console.error);
