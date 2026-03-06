# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Collapsed Arena** is a Three.js 3D endless survival game where players control rolling cube creatures, battle enemies, and absorb dropped cubes to grow larger and stronger.

- **Platform**: Pure Web Browser
- **Tech Stack**: Three.js (WebGL) + Ammo.js (WASM physics engine)
- **Architecture**: Layered ECS (Entity-Component-System) variant
- **Language**: TypeScript/JavaScript

## Core Development Principles

### 1. Document-Driven Development (MANDATORY)

This project strictly follows **document-driven development**. ALL implementation must be based on approved design documents:

- **Game Design Document**: [docs/game-design.md](docs/game-design.md) - Complete game mechanics, numeric systems, and architecture
- **Design Conversation**: [conversation.md](conversation.md) - Full design discussion history
- **Future**: Technical design docs, engineering implementation plans

**Workflow**:
1. Read relevant design documents BEFORE implementing any feature
2. Reference specific sections when making technical decisions
3. Update docs when design changes (never implement unapproved changes)
4. Maintain traceability between code and design requirements

### 2. Configuration-Driven Numeric System

All game numbers must be externalized to JSON config files:
- Combat values (damage, health, absorption rates)
- Enemy spawn parameters
- Performance optimization thresholds
- Camera and physics settings

Config location: `src/config/` (to be created)
Reference: Section 9 in game-design.md for complete config schema

### 3. Zero-UI Design Philosophy

The game has **zero UI, zero text, zero HUD** during gameplay:
- All information conveyed through visual/audio feedback
- Player perceives state through game mechanics alone
- See game-design.md Section 6 for visual feedback system

## Architecture Layers (Bottom-Up)

```
┌─────────────────────────────────────┐
│    UI Layer (minimal - only menus)   │
├─────────────────────────────────────┤
│    Game Logic Layer                  │
│    - EntityManager                   │
│    - CombatSystem                    │
│    - GrowthSystem (cube absorption)  │
│    - DifficultyBalance (AI)          │
├─────────────────────────────────────┤
│    Physics Layer (Ammo.js)           │
│    - Rigid body simulation           │
│    - Collision detection             │
│    - Force application               │
├─────────────────────────────────────┤
│    Rendering Layer (Three.js)        │
│    - Scene, Camera, Lighting         │
│    - Material management              │
├─────────────────────────────────────┤
│    Config Layer (JSON)               │
│    - Numeric balance data            │
└─────────────────────────────────────┘
```

Data Flow: Player Input → Movement/Attack Logic → Physics Simulation → Collision Detection → Combat Calculation → State Update → Render Feedback

## Key Game Mechanics (Implementation Reference)

### Combat & Growth System
- **Fall Attack**: Only fast-falling (mid-air double-click) deals damage
- **Damage Formula**: `ceil(attacker.currentCubes / 8)`
- **Cube Dropping**: Every 1/8 max health damage → enemy drops 1 cube
- **Death Condition**: When `currentCubes < maxHistoricalCubes × 0.125`
- **Absorption**: 50% rate with buffer system (data/presentation separation)
- **Gravity Correction**: Algorithmic position recalculation, NOT physics force

### Performance Optimization (Critical)
- **Dropped Cubes**: Max 200, auto-despawn after 10s
- **Collision Detection**: Spatial partitioning (10m grid) + distance culling (50m range)
- **Three-stage filtering**: Distance → Spatial partition → Precise collision

### Numeric System
- Historical max cubes: `max(8, actualHistoricalMax)` (minimum 8)
- Attack power: `ceil(maxHistoricalCubes / 8)` (minimum 1)
- Health: `currentCubes × 1`

## Development Commands

```bash
# Install dependencies
npm install

# Development server (when project is set up)
npm run dev

# Build (when project is set up)
npm run build

# Run tests (when implemented)
npm test
```

**Note**: This is a new project. Commands above are placeholders until build system is configured.

## Code Organization Guidelines

### ECS Structure
- **Entity**: Base class with id, type, position, components
- **Components**: CubeClusterComponent, CombatComponent, MovementComponent
- **Systems**: Separate logic from data, process entities by components

### File Structure (Planned)
```
src/
├── config/          # JSON game balance files
├── core/            # Entity, Component base classes
├── systems/         # CombatSystem, GrowthSystem, etc.
├── physics/         # Ammo.js wrapper
├── rendering/       # Three.js scene setup
├── ui/              # Minimal menu system
└── main.ts          # Entry point
```

## Important Implementation Notes

1. **Physics-Driven Rendering**: Sync render positions to physics, never the reverse
2. **Data/Presentation Separation**: Absorption buffer system is a prime example
3. **No Magic Numbers**: All values in config, documented with formulas
4. **Performance First**: Optimizations (spatial partitioning, object pooling) are mandatory, not optional
5. **Ammo.js WASM**: Required for handling massive numbers of physics objects (hundreds of cubes)

## When Implementing Features

1. **Read First**: Always consult game-design.md for mechanic details
2. **Config First**: Define numeric values in config before coding logic
3. **Test Against Docs**: Verify implementation matches design document formulas
4. **Update Docs**: If design changes during implementation, update docs first

## Document References

| Topic | Document | Section |
|-------|----------|---------|
| Core Mechanics | game-design.md | Section 2 |
| Numeric Formulas | game-design.md | Section 3 |
| Architecture | game-design.md | Section 4 |
| Components | game-design.md | Section 5 |
| Visual Feedback | game-design.md | Section 6 |
| Config Schema | game-design.md | Section 9 |
| Development Principles | conversation.md | Lines 9-11 |

---

**Remember**: When in doubt, READ THE DOCS. This project is built on documented requirements, not assumptions.
