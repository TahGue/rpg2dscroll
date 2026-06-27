import { describe, expect, it } from 'vitest';
import { mergeSaveData, DEFAULT_SAVE } from './save';

describe('mergeSaveData', () => {
  it('fills missing fields from defaults', () => {
    const merged = mergeSaveData({ gold: 250, version: 2 });
    expect(merged.gold).toBe(250);
    expect(merged.level).toBe(DEFAULT_SAVE.level);
    expect(merged.unlockedMissions).toEqual(DEFAULT_SAVE.unlockedMissions);
  });

  it('syncs material counts into inventory', () => {
    const merged = mergeSaveData({ iron: 5, leather: 3, version: 2 });
    expect(merged.inventory.iron_ingot).toBe(5);
    expect(merged.inventory.leather_hide).toBe(3);
  });

  it('merges key bindings with defaults', () => {
    const merged = mergeSaveData({
      version: 2,
      settings: {
        ...DEFAULT_SAVE.settings,
        keyBindings: { ...DEFAULT_SAVE.settings.keyBindings, attack: 'X' },
      },
    });
    expect(merged.settings.keyBindings.attack).toBe('X');
    expect(merged.settings.keyBindings.jump).toBe(DEFAULT_SAVE.settings.keyBindings.jump);
  });
});
