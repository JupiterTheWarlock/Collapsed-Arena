import * as THREE from 'three';

/**
 * Particle - Single particle instance
 */
interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  type: 'trail' | 'impact' | 'burst' | 'flow';
}

/**
 * ParticleSystem - Visual particle effects
 *
 * Handles trails, impacts, bursts, and absorption effects
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: any;
  private maxParticles: number = 500;

  private particleGeometry: THREE.SphereGeometry;
  private particleMaterial: THREE.MeshBasicMaterial;

  constructor(scene: any) {
    this.scene = scene;
    this.particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    this.particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
  }

  /**
   * Emit trail particles
   * @param position - Emission position
   * @param type - Trail type ('normal' or 'fastfall')
   */
  emitTrail(position: THREE.Vector3, type: 'normal' | 'fastfall'): void {
    const count = type === 'fastfall' ? 5 : 2;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      mesh.position.copy(position);

      // Random offset
      mesh.position.x += (Math.random() - 0.5) * 0.5;
      mesh.position.y += (Math.random() - 0.5) * 0.5;
      mesh.position.z += (Math.random() - 0.5) * 0.5;

      const scale = type === 'fastfall' ? 0.15 : 0.08;
      mesh.scale.set(scale, scale, scale);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );

      const lifetime = type === 'fastfall' ? 1.5 : 1.0;

      this.particles.push({
        mesh,
        velocity,
        lifetime,
        maxLifetime: lifetime,
        type: 'trail'
      });

      this.scene.add(mesh);
    }
  }

  /**
   * Emit impact particles
   * @param position - Impact position
   * @param intensity - Impact intensity (affects particle count)
   */
  emitImpact(position: THREE.Vector3, intensity: number): void {
    const count = Math.min(20, Math.floor(intensity));

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      mesh.position.copy(position);

      // Random offset
      mesh.position.x += (Math.random() - 0.5) * 1.0;
      mesh.position.y += (Math.random() - 0.5) * 1.0;
      mesh.position.z += (Math.random() - 0.5) * 1.0;

      const scale = 0.1 + Math.random() * 0.1;
      mesh.scale.set(scale, scale, scale);

      // Explosion velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 5,
        (Math.random() - 0.5) * 10
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.8,
        maxLifetime: 0.8,
        type: 'impact'
      });

      this.scene.add(mesh);
    }
  }

  /**
   * Emit cube drop burst particles
   * @param position - Drop position
   */
  emitCubeDrop(position: THREE.Vector3): void {
    const count = 15;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      mesh.position.copy(position);

      mesh.material.color.setHex(0x4a90e2);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6,
        (Math.random() - 0.5) * 8
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 1.2,
        maxLifetime: 1.2,
        type: 'burst'
      });

      this.scene.add(mesh);
    }
  }

  /**
   * Emit absorption particles (flow from source to target)
   * @param from - Source position
   * @param to - Target position
   */
  emitAbsorption(from: THREE.Vector3, to: THREE.Vector3): void {
    const count = 8;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      mesh.position.copy(from);

      mesh.material.color.setHex(0x00ff00);
      mesh.scale.set(0.05, 0.05, 0.05);

      // Velocity towards target
      const direction = new THREE.Vector3().subVectors(to, from).normalize();
      const speed = 3 + Math.random() * 2;
      const velocity = direction.multiplyScalar(speed);

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.5,
        maxLifetime: 0.5,
        type: 'flow'
      });

      this.scene.add(mesh);
    }
  }

  /**
   * Update all particles
   * @param deltaTime - Time since last frame (in seconds)
   */
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update lifetime
      particle.lifetime -= deltaTime;

      // Remove expired particles
      if (particle.lifetime <= 0) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        (particle.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

      // Apply gravity to non-flow particles
      if (particle.type !== 'flow') {
        particle.velocity.y -= 9.8 * deltaTime;
      }

      // Update opacity
      const lifeRatio = particle.lifetime / particle.maxLifetime;
      particle.mesh.material.opacity = lifeRatio * 0.8;
    }
  }

  /**
   * Get active particle count
   * @returns Number of active particles
   */
  getActiveParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Reset all particles
   */
  reset(): void {
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      (particle.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }

  /**
   * Dispose of particle system
   */
  dispose(): void {
    this.reset();
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }
}
