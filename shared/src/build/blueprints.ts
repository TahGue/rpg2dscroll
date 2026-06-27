import type { BuildChoice } from '../types/save';

export const DEFAULT_BLUEPRINTS: BuildChoice[] = ['arrow_tower'];

export const BLUEPRINT_LABELS: Record<string, string> = {
  arrow_tower: 'Arrow Tower',
  spike_trap: 'Spike Trap',
  iron_tower: 'Iron Tower',
};

export function hasBlueprint(blueprints: string[], id: BuildChoice): boolean {
  return blueprints.includes(id);
}

export function getBlueprintUnlockMessage(id: BuildChoice): string {
  switch (id) {
    case 'spike_trap':
      return 'Spike Trap blueprint recovered from the wreckage!';
    case 'iron_tower':
      return 'Iron Tower schematics learned at the mine!';
    default:
      return `${BLUEPRINT_LABELS[id] ?? id} blueprint unlocked!`;
  }
}
