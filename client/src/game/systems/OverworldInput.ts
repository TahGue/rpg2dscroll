type MoveDir = 'up' | 'down' | 'left' | 'right';

const MOVE_KEYS: Record<MoveDir, string[]> = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight'],
};

class OverworldInputImpl {
  private held: Record<MoveDir, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private interactDown = false;
  private mapToggleDown = false;
  private attached = false;

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.setHeldFromKey(event.key, true)) {
      event.preventDefault();
    }
    if (event.key === 'e' || event.key === 'E') {
      this.interactDown = true;
      event.preventDefault();
    }
    if (event.key === 'm' || event.key === 'M') {
      this.mapToggleDown = true;
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (this.setHeldFromKey(event.key, false)) {
      event.preventDefault();
    }
  };

  private onBlur = (): void => {
    this.held = { up: false, down: false, left: false, right: false };
    this.interactDown = false;
  };

  private setHeldFromKey(key: string, down: boolean): boolean {
    for (const dir of Object.keys(MOVE_KEYS) as MoveDir[]) {
      if (MOVE_KEYS[dir].includes(key)) {
        this.held[dir] = down;
        return true;
      }
    }
    return false;
  }

  attach(): void {
    if (this.attached) return;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.onBlur();
    this.attached = false;
  }

  setHeld(dir: MoveDir, down: boolean): void {
    this.held[dir] = down;
  }

  isHeld(dir: MoveDir): boolean {
    return this.held[dir];
  }

  consumeInteract(): boolean {
    if (!this.interactDown) return false;
    this.interactDown = false;
    return true;
  }

  pulseInteract(): void {
    this.interactDown = true;
  }

  consumeMapToggle(): boolean {
    if (!this.mapToggleDown) return false;
    this.mapToggleDown = false;
    return true;
  }
}

export const OverworldInput = new OverworldInputImpl();
export type { MoveDir };
