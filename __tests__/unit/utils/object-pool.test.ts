import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ObjectPool } from '@/utils/object-pool';

// Test object class
class TestObject {
  public value: number = 0;
  public reset(): void {
    this.value = 0;
  }
}

describe('Utils - ObjectPool', () => {
  let pool: ObjectPool<TestObject>;

  beforeEach(() => {
    pool = new ObjectPool<TestObject>(() => new TestObject());
  });

  afterEach(() => {
    if (pool) {
      pool.dispose();
    }
  });

  it('should create new object on first acquire', () => {
    const obj = pool.acquire();
    expect(obj).toBeInstanceOf(TestObject);
  });

  it('should reuse object from pool when available', () => {
    const obj1 = pool.acquire();
    obj1.value = 42;

    pool.release(obj1);
    const obj2 = pool.acquire();

    expect(obj2).toBe(obj1);  // Same object reference
    expect(obj2.value).toBe(0);  // Reset to default
  });

  it('should create multiple objects as needed', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();

    expect(obj1).not.toBe(obj2);
    expect(obj2).not.toBe(obj3);
  });

  it('should respect max pool size', () => {
    const maxSize = 5;
    const limitedPool = new ObjectPool<TestObject>(
      () => new TestObject(),
      maxSize
    );

    // Acquire and release many objects
    for (let i = 0; i < 20; i++) {
      const obj = limitedPool.acquire();
      obj.value = i;
      limitedPool.release(obj);
    }

    // Pool should not exceed max size
    expect(limitedPool.getSize()).toBeLessThanOrEqual(maxSize);
    limitedPool.dispose();
  });

  it('should reset objects when releasing', () => {
    const obj = pool.acquire();
    obj.value = 999;

    pool.release(obj);
    const obj2 = pool.acquire();

    expect(obj2.value).toBe(0);  // Should be reset
  });

  it('should clear pool', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();

    pool.release(obj1);
    pool.release(obj2);

    expect(pool.getSize()).toBeGreaterThan(0);

    pool.clear();
    expect(pool.getSize()).toBe(0);
  });

  it('should track active object count', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();

    expect(pool.getActiveCount()).toBe(2);

    pool.release(obj1);
    expect(pool.getActiveCount()).toBe(1);
  });

  it('should preallocate objects', () => {
    pool.preallocate(10);

    expect(pool.getSize()).toBe(10);
    expect(pool.getActiveCount()).toBe(0);

    // Acquired objects should come from preallocated pool
    const obj = pool.acquire();
    expect(pool.getActiveCount()).toBe(1);
    expect(pool.getSize()).toBe(9);  // One less after acquire
  });
});
