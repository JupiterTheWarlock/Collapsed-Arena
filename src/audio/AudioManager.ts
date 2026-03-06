/**
 * AudioManager - Audio feedback system
 *
 * Plays sound effects for game events
 */

export class AudioManager {
  private masterVolume: number = 1.0;
  private audioEnabled: boolean = true;

  constructor() {
    // Check if Web Audio API is available
    this.audioEnabled = typeof Audio !== 'undefined';
  }

  /**
   * Play jump sound
   */
  playJump(): void {
    if (!this.audioEnabled) return;
    this.playSound('jump', 0.3);
  }

  /**
   * Play fast-fall sound
   */
  playFastFall(): void {
    if (!this.audioEnabled) return;
    this.playSound('fastfall', 0.4);
  }

  /**
   * Play impact sound with intensity
   * @param intensity - Impact intensity (affects volume)
   */
  playImpact(intensity: number): void {
    if (!this.audioEnabled) return;
    const volume = Math.min(0.8, intensity * 0.1);
    this.playSound('impact', volume);
  }

  /**
   * Play damage sound
   */
  playDamage(): void {
    if (!this.audioEnabled) return;
    this.playSound('damage', 0.5);
  }

  /**
   * Play kill sound
   */
  playKill(): void {
    if (!this.audioEnabled) return;
    this.playSound('kill', 0.6);
  }

  /**
   * Play death sound
   */
  playDeath(): void {
    if (!this.audioEnabled) return;
    this.playSound('death', 0.8);
  }

  /**
   * Play cube drop sound
   */
  playCubeDrop(): void {
    if (!this.audioEnabled) return;
    this.playSound('cube-drop', 0.3);
  }

  /**
   * Play absorption sound
   */
  playAbsorption(): void {
    if (!this.audioEnabled) return;
    this.playSound('absorption', 0.2);
  }

  /**
   * Get master volume
   * @returns Volume (0.0 to 1.0)
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0.0, Math.min(1.0, volume));
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.masterVolume = 0.0;
  }

  /**
   * Unmute audio (restore to previous volume)
   * @param volume - Volume to restore (default: 1.0)
   */
  unmute(volume: number = 1.0): void {
    this.masterVolume = Math.max(0.0, Math.min(1.0, volume));
  }

  /**
   * Play a sound effect
   * @param soundName - Name of the sound
   * @param volume - Volume level (0.0 to 1.0)
   */
  private playSound(soundName: string, volume: number): void {
    if (!this.audioEnabled || this.masterVolume === 0.0) return;

    try {
      // In production, this would load actual audio files
      // For now, we create a placeholder Audio object
      const audio = new Audio();

      // Apply master volume
      audio.volume = volume * this.masterVolume;

      // In production: audio.src = `/assets/sounds/${soundName}.mp3`;
      // For testing, we just call play()
      audio.play().catch((error) => {
        // Silently ignore autoplay errors
        // Browsers block audio until user interaction
      });
    } catch (error) {
      // Silently ignore audio errors
    }
  }

  /**
   * Dispose of audio manager
   */
  dispose(): void {
    // Nothing to dispose currently
    // In production, would stop all playing sounds
  }
}
