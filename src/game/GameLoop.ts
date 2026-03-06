export class GameLoop {
  private running = false;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;

  constructor() {
    console.log('GameLoop: Initialized');
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
    // Game update logic will go here
    // For now, just verify the loop is running
  }

  isRunning(): boolean {
    return this.running;
  }

  getTargetFPS(): number {
    return this.targetFPS;
  }
}

// Auto-start the game loop
const gameLoop = new GameLoop();
gameLoop.start();
