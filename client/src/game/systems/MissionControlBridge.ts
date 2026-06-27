/** Bridges React HUD controls to Phaser mission systems (wave start, etc.). */
class MissionControlBridgeImpl {
  private onStartWave: (() => void) | null = null;

  register(onStartWave: () => void): void {
    this.onStartWave = onStartWave;
  }

  requestStartWave(): void {
    this.onStartWave?.();
  }

  reset(): void {
    this.onStartWave = null;
  }
}

export const MissionControlBridge = new MissionControlBridgeImpl();
