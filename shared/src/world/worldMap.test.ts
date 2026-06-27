import { DEFAULT_SAVE } from '../types/save';
import {
  getCurrentMapNodeId,
  getMapNodeState,
  getMapPathState,
  getNewlyAccessibleLocations,
  isLocationUnlocked,
} from './worldMap';
import { describe, expect, it } from 'vitest';

describe('worldMap progression', () => {
  it('starts at night attack as current objective', () => {
    const save = { ...DEFAULT_SAVE };
    expect(getCurrentMapNodeId(save)).toBe('night-attack');
  });

  it('marks night attack as current when unlocked but incomplete', () => {
    const save = { ...DEFAULT_SAVE };
    const current = getCurrentMapNodeId(save);
    expect(getMapNodeState('night-attack', save, current)).toBe('current');
    expect(getMapNodeState('silent-oasis', save, current)).toBe('locked');
  });

  it('unlocks silent oasis after night attack victory', () => {
    const before = { ...DEFAULT_SAVE };
    const after = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      unlockedMissions: [...DEFAULT_SAVE.unlockedMissions, 'silent-oasis'],
    };
    const unlocked = getNewlyAccessibleLocations(before, after);
    expect(unlocked).toContain('silent-oasis');
  });

  it('advances current node after completing night attack', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      unlockedMissions: [...DEFAULT_SAVE.unlockedMissions, 'silent-oasis'],
    };
    expect(getCurrentMapNodeId(save)).toBe('silent-oasis');
    expect(getMapNodeState('night-attack', save, getCurrentMapNodeId(save))).toBe('completed');
  });

  it('reports completed path after mission cleared', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      unlockedMissions: [...DEFAULT_SAVE.unlockedMissions, 'silent-oasis'],
    };
    expect(getMapPathState('nahran-camp', 'night-attack', save)).toBe('completed');
    expect(getMapPathState('night-attack', 'silent-oasis', save)).toBe('unlocked');
  });

  it('camp is always unlocked', () => {
    const save = { ...DEFAULT_SAVE };
    expect(isLocationUnlocked('nahran-camp', undefined, save)).toBe(true);
  });
});
