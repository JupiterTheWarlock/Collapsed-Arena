/**
 * Game state type
 */
export type StateType = 'MENU' | 'PLAYING' | 'GAME_OVER';

/**
 * State change callback
 */
export type StateChangeCallback = (newState: StateType) => void;

/**
 * GameState - Manages game state transitions
 *
 * Handles MENU → PLAYING → GAME_OVER → MENU flow
 */
export class GameState {
  private currentState: StateType = 'MENU';
  private gameOverTime: number = 0;
  private gameOverTimeout: number = 2.0;  // 2 seconds before auto-return to menu
  private gameTime: number = 0.0;
  private stateChangeCallbacks: StateChangeCallback[] = [];

  /**
   * Get current state
   * @returns Current state
   */
  getCurrentState(): StateType {
    return this.currentState;
  }

  /**
   * Check if in specific state
   * @param state - State to check
   * @returns true if in state
   */
  isInState(state: StateType): boolean {
    return this.currentState === state;
  }

  /**
   * Start game (MENU → PLAYING)
   */
  startGame(): void {
    if (this.currentState === 'PLAYING') {
      return;  // Already playing
    }

    this.setState('PLAYING');
    this.gameTime = 0.0;
  }

  /**
   * Trigger game over (PLAYING → GAME_OVER)
   */
  triggerGameOver(): void {
    if (this.currentState !== 'PLAYING') {
      return;  // Not playing
    }

    this.setState('GAME_OVER');
    this.gameOverTime = 0;
  }

  /**
   * Update state (handle auto-return to menu)
   * @param deltaTime - Time since last frame (in seconds)
   */
  update(deltaTime: number): void {
    // Only accumulate game time when playing
    if (this.currentState === 'PLAYING') {
      this.gameTime += deltaTime;
    }

    // Auto-return to menu after game over timeout
    if (this.currentState === 'GAME_OVER') {
      this.gameOverTime += deltaTime;

      if (this.gameOverTime >= this.gameOverTimeout) {
        this.setState('MENU');
        this.gameOverTime = 0;
      }
    }
  }

  /**
   * Get total game time
   @returns Game time in seconds
   */
  getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.setState('MENU');
    this.gameTime = 0.0;
    this.gameOverTime = 0;
  }

  /**
   * Register state change callback
   * @param callback - Callback function
   */
  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Set state and notify callbacks
   * @param newState - New state
   */
  private setState(newState: StateType): void {
    const oldState = this.currentState;
    this.currentState = newState;

    if (oldState !== newState) {
      this.notifyStateChange(newState);
    }
  }

  /**
   * Notify all registered callbacks
   * @param newState - New state
   */
  private notifyStateChange(newState: StateType): void {
    for (const callback of this.stateChangeCallbacks) {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    }
  }

  /**
   * Dispose of game state
   */
  dispose(): void {
    this.stateChangeCallbacks = [];
  }
}
