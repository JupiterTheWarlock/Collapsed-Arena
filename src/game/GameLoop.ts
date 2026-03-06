export type UpdateCallback = (deltaTime: number) => void;

export class GameLoop {
  private running = false;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;
  private updateCallbacks: UpdateCallback[] = [];

  constructor() {
    console.log('GameLoop: Initialized');
  }

  /**
   * Register update callback
   * @param callback - Function to call each frame
   */
  onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  start(): void {
    if (this.running) {
      console.warn('GameLoop: Already running');
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.loop();

    console.log(`GameLoop: Started (target: ${this.targetFPS} FPS)`);
  }

  stop(): void {
    this.running = false;
    console.log('GameLoop: Stopped');
  }

  private loop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= this.frameTime) {
      this.update(deltaTime / 1000); // Convert to seconds
      this.lastTime = currentTime - (deltaTime % this.frameTime);
    }

    requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    // Call all registered update callbacks
    for (const callback of this.updateCallbacks) {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getTargetFPS(): number {
    return this.targetFPS;
  }
}
