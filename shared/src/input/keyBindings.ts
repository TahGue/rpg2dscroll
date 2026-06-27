/** Phaser keyboard key strings (see Phaser.Input.Keyboard.KeyCodes). */
export type ControlAction =
  | 'move_left'
  | 'move_right'
  | 'jump'
  | 'attack'
  | 'block'
  | 'dodge'
  | 'shield_bash'
  | 'sand_slash'
  | 'bow'
  | 'spear'
  | 'war_cry'
  | 'sentinel'
  | 'repair'
  | 'build'
  | 'cycle_build'
  | 'lion_roar'
  | 'pause';

export type KeyBindings = Record<ControlAction, string>;

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  move_left: 'A',
  move_right: 'D',
  jump: 'W',
  attack: 'J',
  block: 'K',
  dodge: 'SHIFT',
  shield_bash: 'U',
  sand_slash: 'I',
  bow: 'O',
  spear: 'H',
  war_cry: 'T',
  sentinel: 'G',
  repair: 'R',
  build: 'B',
  cycle_build: 'N',
  lion_roar: 'L',
  pause: 'P',
};

export const CONTROL_ACTION_LABELS: Record<ControlAction, string> = {
  move_left: 'Move left',
  move_right: 'Move right',
  jump: 'Jump',
  attack: 'Attack',
  block: 'Block',
  dodge: 'Dodge',
  shield_bash: 'Shield Bash',
  sand_slash: 'Sand Slash',
  bow: 'Bow',
  spear: 'Spear',
  war_cry: 'War Cry',
  sentinel: 'Sentinel Shield',
  repair: 'Repair',
  build: 'Build',
  cycle_build: 'Cycle build',
  lion_roar: 'Lion Roar',
  pause: 'Pause',
};

export function formatKeyLabel(key: string): string {
  if (key === 'SPACE') return 'Space';
  if (key === 'SHIFT') return 'Shift';
  return key;
}

export function keyboardEventToPhaserKey(e: KeyboardEvent): string {
  if (e.code === 'Space') return 'SPACE';
  if (e.key === 'Shift') return 'SHIFT';
  if (e.key.length === 1) return e.key.toUpperCase();
  const map: Record<string, string> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
  };
  return map[e.key] ?? e.key.toUpperCase();
}
