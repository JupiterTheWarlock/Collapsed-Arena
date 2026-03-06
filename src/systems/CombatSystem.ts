import { System } from '@/core/System';
import { Entity } from '@/core/Entity';
import { CombatComponent, CubeClusterComponent, DroppedCubeComponent, AbsorptionComponent } from '@/components';
import { getCombatConfig } from '@/config/config-loader';

/**
 * CombatSystem - Handles combat mechanics
 *
 * Implements damage, cube dropping, absorption, and death mechanics
 */
export class CombatSystem extends System {
  constructor() {
    super('CombatSystem');
  }

  /**
   * Update combat state for all entities
   * @param deltaTime - Time since last frame (in seconds)
   * @param entities - All entities in the game
   */
  update(deltaTime: number, entities: Entity[]): void {
    const config = getCombatConfig();

    for (const entity of entities) {
      if (!entity.isActive()) continue;

      const combat = entity.getComponent('CombatComponent') as CombatComponent;
      const cluster = entity.getComponent('CubeClusterComponent') as CubeClusterComponent;

      if (!combat || !cluster || combat.isDead) continue;

      // Check for death (cubes < 12.5% of max) regardless of damage
      if (cluster.cubeCount < combat.maxHealth * config.deathThreshold) {
        combat.isDead = true;
        continue;
      }

      // Check for cube drop threshold (accumulated damage >= 1/8 of max health)
      const dropThreshold = combat.maxHealth * config.cubeDropThreshold;

      if (combat.accumulatedDamage >= dropThreshold) {
        // Drop 1 cube
        if (cluster.cubeCount > 0) {
          cluster.cubeCount--;
          combat.health = cluster.cubeCount;
          combat.accumulatedDamage = 0;

          // Check for death after dropping
          if (cluster.cubeCount < combat.maxHealth * config.deathThreshold) {
            combat.isDead = true;
          }
        }
      }
    }
  }

  /**
   * Handle fast-fall collision damage
   * @param attacker - Entity performing fast-fall attack
   * @param target - Entity being attacked
   */
  handleFastFallCollision(attacker: Entity, target: Entity): void {
    const attackerCombat = attacker.getComponent('CombatComponent') as CombatComponent;
    const targetCombat = target.getComponent('CombatComponent') as CombatComponent;

    if (!attackerCombat || !targetCombat || targetCombat.isDead) return;

    // Calculate damage: ceil(currentCubes / 8)
    const damage = Math.ceil(attackerCombat.health / 8);

    // Apply damage to target
    targetCombat.accumulatedDamage += damage;
  }

  /**
   * Collect dropped cube
   * @param collector - Entity collecting the cube
   * @param droppedCube - The dropped cube entity
   */
  collectDroppedCube(collector: Entity, droppedCube: Entity): void {
    const absorption = collector.getComponent('AbsorptionComponent') as AbsorptionComponent;
    const cluster = collector.getComponent('CubeClusterComponent') as CubeClusterComponent;
    const combat = collector.getComponent('CombatComponent') as CombatComponent;
    const droppedComp = droppedCube.getComponent('DroppedCubeComponent') as DroppedCubeComponent;

    if (!absorption || !cluster || !combat || !droppedComp) return;

    const config = getCombatConfig();

    // Add to absorption buffer (50% rate)
    absorption.buffer += config.absorptionRate;

    // Check if buffer is full
    if (absorption.buffer >= absorption.maxBuffer) {
      // Add cube to cluster
      const cubesToAdd = Math.floor(absorption.buffer);
      cluster.cubeCount += cubesToAdd;
      combat.health = cluster.cubeCount;
      combat.maxHealth = Math.max(combat.maxHealth, cluster.cubeCount);

      // Keep remainder
      absorption.buffer = absorption.buffer % absorption.maxBuffer;
    }
  }

  /**
   * Dispose of system resources
   */
  dispose(): void {
    // Nothing to dispose
  }
}
