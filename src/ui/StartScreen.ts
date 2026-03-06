/**
 * Start screen UI component
 */
export class StartScreen {
  private container: HTMLElement;
  private startCallback: (() => void) | null = null;
  private visible: boolean = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Render start screen HTML
   */
  private render(): void {
    this.container.innerHTML = `
      <div class="start-screen" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        font-family: Arial, sans-serif;
      ">
        <h1 style="font-size: 48px; margin-bottom: 32px;">Collapsed Arena</h1>
        <button id="start-button" style="
          padding: 16px 48px;
          font-size: 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        ">Start Game</button>
      </div>
    `;

    // Attach button click handler
    const button = this.container.querySelector('#start-button') as HTMLButtonElement;
    if (button) {
      button.onclick = () => {
        if (this.startCallback) {
          this.startCallback();
        }
      };
    }
  }

  /**
   * Check if start screen is visible
   * @returns true if visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Hide start screen
   */
  hide(): void {
    const screen = this.container.querySelector('.start-screen') as HTMLElement;
    if (screen) {
      screen.style.display = 'none';
    }
    this.visible = false;
  }

  /**
   * Show start screen
   */
  show(): void {
    const screen = this.container.querySelector('.start-screen') as HTMLElement;
    if (screen) {
      screen.style.display = 'flex';
    }
    this.visible = true;
  }

  /**
   * Register start callback
   * @param callback - Callback function
   */
  onStart(callback: () => void): void {
    this.startCallback = callback;
  }

  /**
   * Dispose of start screen
   */
  dispose(): void {
    this.startCallback = null;
    this.visible = false;
  }
}
