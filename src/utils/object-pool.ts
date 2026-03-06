/**
 * ObjectPool - Generic object pooling for performance
 *
 * Reuses objects to reduce garbage collection pressure
 */

export interface PooledObject {
  reset?: () => void;
}

export class ObjectPool<T extends PooledObject> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private factory: () => T;
  private maxSize: number;

  /**
   * Create object pool
   * @param factory - Function to create new objects
   * @param maxSize - Maximum pool size (default: unlimited)
   */
  constructor(factory: () => T, maxSize: number = Number.MAX_VALUE) {
    this.factory = factory;
    this.maxSize = maxSize;
  }

  /**
   * Acquire an object from the pool
   * @returns Object from pool or newly created
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }

    this.active.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   * @param obj - Object to release
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      return;  // Not from this pool
    }

    this.active.delete(obj);

    // Reset object if it has a reset method
    if (obj.reset) {
      obj.reset();
    }

    // Add back to pool if not at max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }

  /**
   * Get current pool size
   * @returns Number of pooled objects
   */
  getSize(): number {
    return this.pool.length;
  }

  /**
   * Get number of active objects
   * @returns Number of acquired objects
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Preallocate objects
   * @param count - Number of objects to preallocate
   */
  preallocate(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.pool.length >= this.maxSize) break;

      const obj = this.factory();
      if (obj.reset) {
        obj.reset();
      }
      this.pool.push(obj);
    }
  }

  /**
   * Dispose of the pool
   */
  dispose(): void {
    this.pool = [];
    this.active.clear();
  }
}
