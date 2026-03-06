/**
 * InputManager - Handles player input using Pointer Lock API
 *
 * Manages mouse movement for camera control and button clicks for game actions.
 * Third-person game style: horizontal mouse controls player direction,
 * vertical mouse controls camera pitch.
 */

export type MouseButton = 'left' | 'right' | 'middle';

export class InputManager {
  private isPointerLocked = false;
  private mouseXMovement = 0;
  private mouseYMovement = 0;
  private mouseSensitivity = 0.002;
  private playerYaw = 0; // Player's horizontal movement direction (radians)
  private cameraPitch = 0; // Camera's vertical angle (radians)
  private maxPitch = Math.PI / 3; // Max 60 degrees up/down
  private mouseButtons: Map<MouseButton, boolean> = new Map();
  private leftClickCount = 0; // Track clicks for jump vs fast-fall
  private onPointerLockChange: (() => void) | null = null;
  private onPointerLockError: (() => void) | null = null;

  constructor(private targetElement: HTMLElement) {
    this.initializeMouseButtons();
    this.setupEventListeners();
  }

  /**
   * Initialize mouse button states
   */
  private initializeMouseButtons(): void {
    this.mouseButtons.set('left', false);
    this.mouseButtons.set('right', false);
    this.mouseButtons.set('middle', false);
  }

  /**
   * Set up event listeners for pointer lock and mouse input
   */
  private setupEventListeners(): void {
    // Pointer lock change
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange?.());
    document.addEventListener('pointerlockerror', () => this.onPointerLockError?.());

    // Mouse movement (only when pointer locked)
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseXMovement = e.movementX;
        this.mouseYMovement = e.movementY;
      }
    });

    // Mouse button events
    document.addEventListener('mousedown', (e) => {
      const button = this.getMouseButton(e.button);
      if (button) {
        this.mouseButtons.set(button, true);

        // Track left clicks for jump vs fast-fall
        if (button === 'left') {
          this.leftClickCount++;
        }
      }
    });

    document.addEventListener('mouseup', (e) => {
      const button = this.getMouseButton(e.button);
      if (button) {
        this.mouseButtons.set(button, false);
      }
    });

    // Handle wheel/zoom (prevent default)
    document.addEventListener('wheel', (e) => {
      if (this.isPointerLocked) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * Convert button code to MouseButton enum
   */
  private getMouseButton(buttonCode: number): MouseButton | null {
    switch (buttonCode) {
      case 0: return 'left';
      case 1: return 'middle';
      case 2: return 'right';
      default: return null;
    }
  }

  /**
   * Request pointer lock on the target element
   */
  requestPointerLock(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onPointerLockChange = () => {
        this.isPointerLocked = (document.pointerLockElement === this.targetElement);
        if (this.isPointerLocked) {
          console.log('InputManager: Pointer lock acquired');
          resolve();
        } else {
          console.log('InputManager: Pointer lock lost');
        }
      };

      this.onPointerLockError = () => {
        console.error('InputManager: Pointer lock error');
        reject(new Error('Pointer lock request failed'));
      };

      this.targetElement.requestPointerLock();
    });
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock(): void {
    document.exitPointerLock();
  }

  /**
   * Update input state (call once per frame)
   */
  update(): void {
    if (!this.isPointerLocked) {
      this.mouseXMovement = 0;
      this.mouseYMovement = 0;
      return;
    }

    // Update player yaw (horizontal rotation) based on mouse movement
    this.playerYaw += this.mouseXMovement * this.mouseSensitivity;

    // Normalize yaw to -PI to PI
    while (this.playerYaw > Math.PI) this.playerYaw -= 2 * Math.PI;
    while (this.playerYaw < -Math.PI) this.playerYaw += 2 * Math.PI;

    // Update camera pitch (vertical rotation) based on mouse movement
    this.cameraPitch -= this.mouseYMovement * this.mouseSensitivity;

    // Clamp pitch to prevent camera flipping
    this.cameraPitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.cameraPitch));

    // Reset movement for next frame
    this.mouseXMovement = 0;
    this.mouseYMovement = 0;
  }

  /**
   * Check if a mouse button is currently pressed
   */
  isButtonDown(button: MouseButton): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Check if left mouse button was just clicked this frame
   * Returns true on click, and resets the counter
   */
  consumeLeftClick(): boolean {
    const wasClicked = this.leftClickCount > 0;
    this.leftClickCount = 0;
    return wasClicked;
  }

  /**
   * Get the player's movement direction (horizontal yaw)
   */
  getPlayerYaw(): number {
    return this.playerYaw;
  }

  /**
   * Set the player's movement direction
   */
  setPlayerYaw(yaw: number): void {
    this.playerYaw = yaw;
  }

  /**
   * Get the camera's pitch angle (vertical)
   */
  getCameraPitch(): number {
    return this.cameraPitch;
  }

  /**
   * Set the camera's pitch angle
   */
  setCameraPitch(pitch: number): void {
    this.cameraPitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, pitch));
  }

  /**
   * Check if pointer lock is active
   */
  isActive(): boolean {
    return this.isPointerLocked;
  }

  /**
   * Set mouse sensitivity
   */
  setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * Get mouse sensitivity
   */
  getMouseSensitivity(): number {
    return this.mouseSensitivity;
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    this.onPointerLockChange = null;
    this.onPointerLockError = null;
    this.exitPointerLock();
  }
}
