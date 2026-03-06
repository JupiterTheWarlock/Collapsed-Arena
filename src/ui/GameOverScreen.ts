/**
 * Game over screen UI component
 */
export class GameOverScreen {
  private container: HTMLElement;
  private visible: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Render game over screen HTML
   */
  private render(): void {
    this.container.innerHTML = `
      <div class="game-over-screen" style="
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        font-family: Arial, sans-serif;
      ">
        <h1 style="font-size: 64px; margin-bottom: 24px; color: #ff4444;">Game Over</h1>
        <p class="survival-time" style="font-size: 32px; margin-bottom: 16px;">Survived: 0:00</p>
        <p style="font-size: 18px; opacity: 0.7;">Returning to menu...</p>
      </div>
    `;
  }

  /**
   * Format time as MM:SS
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if game over screen is visible
   * @returns true if visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Show game over screen with survival time
   * @param survivalTime - Time survived in seconds
   */
  show(survivalTime: number): void {
    // Rebuild HTML with updated time
    this.container.innerHTML = `
      <div class="game-over-screen" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        font-family: Arial, sans-serif;
      ">
        <h1 style="font-size: 64px; margin-bottom: 24px; color: #ff4444;">Game Over</h1>
        <p class="survival-time" style="font-size: 32px; margin-bottom: 16px;">Survived: ${this.formatTime(survivalTime)}</p>
        <p style="font-size: 18px; opacity: 0.7;">Returning to menu...</p>
      </div>
    `;

    this.visible = true;
  }

  /**
   * Hide game over screen
   */
  hide(): void {
    // Rebuild HTML with display: none
    const timeText = this.container.querySelector('.survival-time') as HTMLElement;
    const currentTime = timeText?.textContent?.match(/Survived: ([\d:]+)/)?.[1] || '0:00';

    this.container.innerHTML = `
      <div class="game-over-screen" style="
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        font-family: Arial, sans-serif;
      ">
        <h1 style="font-size: 64px; margin-bottom: 24px; color: #ff4444;">Game Over</h1>
        <p class="survival-time" style="font-size: 32px; margin-bottom: 16px;">Survived: ${currentTime}</p>
        <p style="font-size: 18px; opacity: 0.7;">Returning to menu...</p>
      </div>
    `;

    this.visible = false;
  }

  /**
   * Dispose of game over screen
   */
  dispose(): void {
    this.visible = false;
  }
}
