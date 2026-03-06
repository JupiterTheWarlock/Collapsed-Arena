# 滚动和碰撞系统重构设计

**设计日期**：2026-03-06
**设计者**：Claude + 用户协作
**状态**：待实施

---

## 问题描述

### 问题1：敌人不会滚动
当前敌人的移动逻辑只是简单地向玩家方向累加速度，没有使用与玩家一致的基于立方体集群大小的滚动机制。

### 问题2：玩家与敌人穿模
碰撞检测系统存在以下问题：
- 使用固定碰撞阈值（1.0m），不考虑实体实际大小
- 分离力太弱，无法实现"实体阻挡"
- 缺少基于实体大小的碰撞半径计算

---

## 设计目标

1. **统一滚动机制**：所有可移动实体使用相同的滚动逻辑
2. **彻底组件化**：遵循 ECS 架构，组件组合而非硬编码
3. **实体阻挡**：实现真实的物理碰撞反馈
4. **职责分离**：决策与执行分离，提高代码可维护性

---

## 核心架构设计

### 新增组件：RollingComponent

**职责**：标记实体具有滚动能力，存储滚动状态

```typescript
class RollingComponent extends Component {
  constructor(
    public rollDirection: number = 0,        // 滚动方向（弧度）
    public speedMultiplier: number = 1.0,    // 速度倍率
    public isAutoRolling: boolean = true     // 是否自动滚动
  ) {
    super('RollingComponent');
  }
}
```

### 修改后的组件组合

| 实体类型 | 核心组件 |
|---------|---------|
| **玩家** | RollingComponent + PlayerControlComponent |
| **敌人** | RollingComponent + AIComponent |
| **共同** | MovementComponent + PhysicsComponent + CubeClusterComponent + CombatComponent |

---

## 系统职责重新划分

### MovementSystem（重构后）

**职责**：处理所有有 `RollingComponent` 的实体的滚动、跳跃、快速坠落

**关键方法**：
```typescript
class MovementSystem extends System {
  private jumpRequested: Set<string> = new Set();
  private fastFallRequested: Set<string> = new Set();

  update(deltaTime: number, entities: Entity[]): void {
    const rollingEntities = entities.filter(e =>
      e.isActive() && e.getComponent('RollingComponent')
    );

    for (const entity of rollingEntities) {
      this.processRolling(entity);
      this.processJump(entity);
      this.processFastFall(entity);
    }
  }

  // 统一滚动逻辑
  private processRolling(entity: Entity): void {
    const rolling = entity.getComponent('RollingComponent');
    const physics = entity.getComponent('PhysicsComponent');
    const cluster = entity.getComponent('CubeClusterComponent');

    if (!rolling.isAutoRolling) return;

    // 统一速度公式
    const diameter = 2 * Math.pow(cluster.cubeCount, 1/3);
    const speed = diameter * rolling.speedMultiplier;

    physics.velocity.x = Math.sin(rolling.rollDirection) * speed;
    physics.velocity.z = Math.cos(rolling.rollDirection) * speed;
  }

  // 公共接口
  requestJump(entityId: string): void
  requestFastFall(entityId: string): void
  setRollDirection(entityId: string, direction: number): void
}
```

### AISystem（简化后）

**职责**：只负责 AI 决策，不直接操作物理

**关键方法**：
```typescript
class AISystem extends System {
  constructor(private movementSystem: MovementSystem) {
    super('AISystem');
  }

  update(deltaTime: number, entities: Entity[]): void {
    const player = entities.find(e => e.getType() === 'player');
    if (!player) return;

    for (const entity of entities) {
      if (!entity.isActive() || entity.getType() !== 'enemy') continue;

      const ai = entity.getComponent('AIComponent');
      const rolling = entity.getComponent('RollingComponent');
      const movement = entity.getComponent('MovementComponent');

      if (!ai || !rolling || !movement) continue;

      // 只做决策，不直接操作 physics
      this.decideRollDirection(entity, player, rolling);
      this.decideJump(entity, player, movement, ai);
      this.decideFastFall(entity, player, movement, ai);
    }
  }

  // 决策方法
  private decideRollDirection(entity: Entity, player: Entity, rolling: RollingComponent): void {
    const toPlayer = new THREE.Vector3()
      .subVectors(player.getPosition(), entity.getPosition())
      .normalize();

    const direction = Math.atan2(toPlayer.x, toPlayer.z);
    rolling.rollDirection = direction;
  }

  private decideJump(entity: Entity, player: Entity, movement: MovementComponent, ai: AIComponent): void {
    const distance = entity.getPosition().distanceTo(player.getPosition());

    if (distance < ai.jumpTriggerDistance && movement.isGrounded) {
      this.movementSystem.requestJump(entity.getId());
    }
  }

  private decideFastFall(entity: Entity, player: Entity, movement: MovementComponent, ai: AIComponent): void {
    const enemyY = entity.getPosition().y;
    const playerY = player.getPosition().y;

    if (!movement.isGrounded && enemyY > playerY + 2) {
      this.movementSystem.requestFastFall(entity.getId());
    }
  }
}
```

### CollisionSystem（修复后）

**职责**：基于实体实际大小检测碰撞，实现"实体阻挡"

**关键方法**：
```typescript
class CollisionSystem extends System {
  // 1. 动态碰撞半径计算
  private calculateEntityRadius(entity: Entity): number {
    const cluster = entity.getComponent('CubeClusterComponent');
    if (!cluster) return 1.0;

    const volume = cluster.cubeCount * Math.pow(cluster.cubeSize, 3);
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1/3);

    return radius;
  }

  // 2. 修改碰撞检测
  private checkCollisions(entities: Entity[]): void {
    for (const entityA of entities) {
      const radiusA = this.calculateEntityRadius(entityA);
      // ...

      for (const entityB of nearbyEntities) {
        const radiusB = this.calculateEntityRadius(entityB);
        const collisionThreshold = radiusA + radiusB;

        if (distance < collisionThreshold) {
          this.handleCollision(entityA, entityB);
        }
      }
    }
  }

  // 3. 实体阻挡效果
  private handlePhysicalCollision(entityA: Entity, entityB: Entity): void {
    const physicsA = entity.getComponent('PhysicsComponent');
    const physicsB = entity.getComponent('PhysicsComponent');
    const movementA = entity.getComponent('MovementComponent');
    const movementB = entity.getComponent('MovementComponent');

    const normal = this.calculateCollisionNormal(entityA, entityB);

    // 停止相对运动（实体阻挡）
    this.zeroTangentialVelocity(physicsA, normal, movementA);
    this.zeroTangentialVelocity(physicsB, normal, movementB);

    // 分离重叠部分
    this.separateEntities(entityA, entityB, normal);
  }

  private zeroTangentialVelocity(
    physics: PhysicsComponent,
    normal: any,
    movement: MovementComponent
  ): void {
    if (!movement.isGrounded) return; // 空中不阻挡

    const dot = physics.velocity.x * normal.x + physics.velocity.z * normal.z;
    physics.velocity.x -= dot * normal.x;
    physics.velocity.z -= dot * normal.z;
  }

  // 4. 快速坠落攻击优先
  private handleCollision(entityA: Entity, entityB: Entity): void {
    const movementA = entity.getComponent('MovementComponent');
    const physicsA = entity.getComponent('PhysicsComponent');
    const combatA = entity.getComponent('CombatComponent');

    // 快速坠落攻击优先
    if (movementA && !movementA.isGrounded && combatA) {
      if (physicsA.velocity.y < -20) {
        this.combatSystemRef.handleFastFallCollision(entityA, entityB);
        return; // 造成伤害后不阻挡
      }
    }

    // 普通碰撞：实体阻挡
    this.handlePhysicalCollision(entityA, entityB);
  }
}
```

---

## 数据流设计

```
InputManager → setRollDirection(playerId, mouseDirection)
                ↓
         MovementSystem.processRolling()
                ↓
         physics.velocity 更新
                ↓
         CollisionSystem 检测碰撞
                ↓
         实体阻挡 / 伤害处理

AISystem → decideRollDirection()
           ↓
    rolling.rollDirection = direction
           ↓
    MovementSystem.processRolling()
           ↓
    physics.velocity 更新
```

---

## 实施计划

### 阶段1：组件和系统重构
- [ ] 创建 `RollingComponent`
- [ ] 修改 `MovementSystem` 统一处理滚动
- [ ] 修改 `AISystem` 只做决策
- [ ] 更新 `InputManager` 设置玩家滚动方向

### 阶段2：碰撞系统修复
- [ ] 添加 `calculateEntityRadius` 方法
- [ ] 修改碰撞检测使用动态阈值
- [ ] 实现"实体阻挡"逻辑
- [ ] 保留快速坠落攻击

### 阶段3：实体创建更新
- [ ] 更新玩家创建逻辑（添加 RollingComponent）
- [ ] 更新敌人生成逻辑（添加 RollingComponent）
- [ ] 移除旧的 PlayerControlComponent 依赖

### 阶段4：测试验证
- [ ] 单元测试
- [ ] 集成测试
- [ ] 游戏内验证

---

## 测试策略

### 单元测试覆盖

**RollingComponent**：
- 存储滚动方向正确
- 应用速度倍率

**MovementSystem**：
- 统一处理玩家和敌人滚动
- 基于立方体数量计算速度
- 支持多实体同时跳跃

**AISystem**：
- 只设置方向，不操作速度
- 通过 MovementSystem 请求跳跃

**CollisionSystem**：
- 从立方体数量计算半径
- 阻挡普通碰撞
- 允许快速坠落攻击

### 集成测试场景
- 玩家滚动速度随立方体增加
- 敌人追踪玩家并使用滚动速度
- 玩家与敌人碰撞时停止移动
- 快速坠落攻击造成伤害
- 多个敌人同时跳跃

### 游戏内验证清单
- [ ] 敌人滚动速度与大小匹配
- [ ] 碰撞时不再穿模
- [ ] 普通碰撞互相阻挡
- [ ] 快速坠落攻击有效
- [ ] 跳跃和快速坠落响应正确

---

## 向后兼容性

**API 变更**：
- `MovementSystem.triggerJump()` → `requestJump(entityId)`
- `MovementSystem.setDirection()` → `setRollDirection(entityId, direction)`
- AISystem 不再直接操作 `physics.velocity`

**迁移步骤**：
1. 更新 InputManager 调用新 API
2. 更新 AISystem 使用 MovementSystem 引用
3. 更新所有实体的组件创建逻辑

---

## 设计原则验证

✅ **组件化**：滚动能力抽象为独立组件
✅ **职责分离**：AISystem 决策，MovementSystem 执行
✅ **代码复用**：统一的滚动逻辑，零重复
✅ **可扩展性**：新的可移动实体只需添加 RollingComponent
✅ **数据驱动**：所有行为基于组件数据，不硬编码

---

## 风险与缓解

**风险1：重构范围大**
- 缓解：分阶段实施，每阶段独立测试

**风险2：性能影响**
- 缓解：动态半径计算缓存结果

**风险3：现有功能破坏**
- 缓解：完整的单元测试覆盖，游戏内验证

---

## 后续优化

1. **性能优化**：缓存实体半径，避免每帧计算
2. **视觉反馈**：滚动时添加旋转动画
3. **AI 增强**：添加更复杂的决策逻辑（包围、撤退）
4. **配置化**：滚动参数可配置
