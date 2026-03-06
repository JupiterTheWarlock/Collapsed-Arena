import * as THREE from 'three';

/**
 * Particle - Single particle data
 */
interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

/**
 * ParticleSystem - Ground movement particle effects
 *
 * Creates simple cube particles when player moves on ground
 * Implements zero-UI design principle: visual feedback over text
 */
export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private particlePool: THREE.Mesh[] = [];
  private maxParticles: number = 100;
  private spawnTimer: number = 0;
  private spawnInterval: number = 0.05; // Spawn every 0.05 seconds
  private particleSize: number = 0.2;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Update particle system
   * @param deltaTime - Time since last frame
   * @param playerPosition - Current player position
   * @param playerVelocity - Current player velocity
   * @param isGrounded - Whether player is on ground
   */
  update(deltaTime: number, playerPosition: THREE.Vector3, playerVelocity: THREE.Vector3, isGrounded: boolean): void {
    // Spawn particles when moving on ground
    if (isGrounded && this.isPlayerMoving(playerVelocity)) {
      this.spawnTimer += deltaTime;

      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnParticle(playerPosition, playerVelocity);
        this.spawnTimer = 0;
      }
    }

    // Update all particles
    this.updateParticles(deltaTime);
  }

  /**
   * Check if player is moving horizontally
   */
  private isPlayerMoving(velocity: THREE.Vector3): boolean {
    const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    return horizontalSpeed > 0.3; // Lower threshold for more particles
  }

  /**
   * Spawn a new particle at player position
   */
  private spawnParticle(playerPosition: THREE.Vector3, playerVelocity: THREE.Vector3): void {
    // Check particle limit
    if (this.particles.length >= this.maxParticles) {
      return;
    }

    // Get or create particle mesh
    let particleMesh: THREE.Mesh;
    if (this.particlePool.length > 0) {
      particleMesh = this.particlePool.pop()!;
    } else {
      // Create new cube particle
      const geometry = new THREE.BoxGeometry(this.particleSize, this.particleSize, this.particleSize);
      const material = new THREE.MeshBasicMaterial({
        color: 0x5bc0de, // Light blue color matching player
        transparent: true,
        opacity: 0.6
      });
      particleMesh = new THREE.Mesh(geometry, material);
      this.scene.add(particleMesh);
    }

    // Position particle at player's feet
    particleMesh.position.set(
      playerPosition.x + (Math.random() - 0.5) * 0.5, // Random offset
      playerPosition.y,
      playerPosition.z + (Math.random() - 0.5) * 0.5
    );

    // Set particle velocity (opposite to player movement with randomness)
    const particleVelocity = new THREE.Vector3(
      -playerVelocity.x * 0.3 + (Math.random() - 0.5) * 2,
      Math.random() * 2, // Upward velocity
      -playerVelocity.z * 0.3 + (Math.random() - 0.5) * 2
    );

    // Create particle
    const particle: Particle = {
      mesh: particleMesh,
      velocity: particleVelocity,
      lifetime: 0,
      maxLifetime: 1.0 + Math.random() * 0.5 // Random lifetime 1.0-1.5s
    };

    this.particles.push(particle);
  }

  /**
   * Update all particles
   */
  private updateParticles(deltaTime: number): void {
    const toRemove: number[] = [];

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Update lifetime
      particle.lifetime += deltaTime;

      // Remove dead particles
      if (particle.lifetime >= particle.maxLifetime) {
        toRemove.push(i);
        continue;
      }

      // Update position
      particle.mesh.position.x += particle.velocity.x * deltaTime;
      particle.mesh.position.y += particle.velocity.y * deltaTime;
      particle.mesh.position.z += particle.velocity.z * deltaTime;

      // Apply gravity
      particle.velocity.y -= 5 * deltaTime;

      // Ground collision
      if (particle.mesh.position.y < -0.9) {
        particle.mesh.position.y = -0.9;
        particle.velocity.y = 0;
        particle.velocity.x *= 0.5; // Friction
        particle.velocity.z *= 0.5;
      }

      // Update opacity based on lifetime
      const lifeFraction = particle.lifetime / particle.maxLifetime;
      const material = particle.mesh.material as THREE.MeshBasicMaterial;
      if (material.opacity !== undefined) {
        material.opacity = 0.6 * (1 - lifeFraction);
      }
    }

    // Remove dead particles (in reverse order to maintain indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const index = toRemove[i];
      const particle = this.particles[index];
      this.particles.splice(index, 1);

      // Return mesh to pool
      particle.mesh.visible = false;
      this.particlePool.push(particle.mesh);
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    for (const particle of this.particles) {
      particle.mesh.visible = false;
      this.particlePool.push(particle.mesh);
    }
    this.particles = [];
  }

  /**
   * Dispose of particle system
   */
  dispose(): void {
    // Remove all particle meshes from scene
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      (particle.mesh.material as THREE.Material).dispose();
    }

    for (const mesh of this.particlePool) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }

    this.particles = [];
    this.particlePool = [];
  }
}
