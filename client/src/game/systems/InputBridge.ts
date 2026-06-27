/** Bridges React touch controls to Phaser gameplay input. */
class InputBridgeImpl {
  private held = {
    left: false,
    right: false,
    block: false,
    repair: false,
  };

  private pulses = new Set<string>();

  setHeld(action: keyof typeof this.held, down: boolean): void {
    this.held[action] = down;
  }

  pulse(action: string): void {
    this.pulses.add(action);
  }

  consumePulse(action: string): boolean {
    if (!this.pulses.has(action)) return false;
    this.pulses.delete(action);
    return true;
  }

  isHeld(action: keyof typeof this.held): boolean {
    return this.held[action];
  }

  reset(): void {
    this.held = { left: false, right: false, block: false, repair: false };
    this.pulses.clear();
  }
}

export const InputBridge = new InputBridgeImpl();

export type TouchAction =
  | 'left'
  | 'right'
  | 'jump'
  | 'attack'
  | 'block'
  | 'dodge'
  | 'bash'
  | 'slash'
  | 'repair'
  | 'build'
  | 'cycle_build'
  | 'roar'
  | 'bow'
  | 'spear'
  | 'war_cry'
  | 'sentinel';
