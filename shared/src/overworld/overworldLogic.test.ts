import { describe, it, expect } from 'vitest';
import { DEFAULT_SAVE } from '../types/save';
import {
  getActiveOverworldPOIs,
  getActiveOverworldWalls,
  getNewExploredCellsNearPoint,
  getOverworldQuestHint,
  getFastTravelDestinations,
  isOverworldPatrolActive,
  isOverworldPOIVisible,
  isOverworldPOIUnlocked,
} from './overworldLogic';
import { SCORPION_VALLEY } from './scorpionValley';
import {
  getActiveRegionTransitions,
  getRegionTransitionAtPoint,
  isRegionTransitionUnlocked,
} from './overworldLogic';
import { NAHRAN_OUTSKIRTS } from './nahranOutskirts';

describe('overworld logic', () => {
  it('hides oasis POIs until night attack is cleared', () => {
    const save = { ...DEFAULT_SAVE, completedMissions: [] as string[] };
    const visible = getActiveOverworldPOIs(NAHRAN_OUTSKIRTS, save);
    expect(visible.some((p) => p.id === 'poi-silent-oasis')).toBe(false);

    const after = { ...save, completedMissions: ['mission-night-attack'] };
    const visibleAfter = getActiveOverworldPOIs(NAHRAN_OUTSKIRTS, after);
    expect(visibleAfter.some((p) => p.id === 'poi-silent-oasis')).toBe(true);
  });

  it('locks red dune pass until silent oasis is saved', () => {
    const save = { ...DEFAULT_SAVE, completedMissions: ['mission-night-attack'] };
    const gate = NAHRAN_OUTSKIRTS.pois.find((p) => p.id === 'poi-red-dune-gate')!;
    expect(isOverworldPOIUnlocked(gate, save)).toBe(false);

    const open = { ...save, completedMissions: ['mission-night-attack', 'mission-silent-oasis'] };
    expect(isOverworldPOIUnlocked(gate, open)).toBe(true);
    expect(getActiveOverworldWalls(NAHRAN_OUTSKIRTS, open).length).toBeLessThan(
      getActiveOverworldWalls(NAHRAN_OUTSKIRTS, save).length,
    );
  });

  it('reveals watchtower after red dune pass', () => {
    const save = { ...DEFAULT_SAVE, completedMissions: ['mission-night-attack', 'mission-silent-oasis'] };
    const tower = NAHRAN_OUTSKIRTS.pois.find((p) => p.id === 'poi-broken-watchtower')!;
    expect(isOverworldPOIVisible(tower, save)).toBe(false);

    const after = { ...save, completedMissions: [...save.completedMissions, 'mission-red-dune-pass'] };
    expect(isOverworldPOIVisible(tower, after)).toBe(true);
  });

  it('explores cells near the player', () => {
    const added = getNewExploredCellsNearPoint('nahran-outskirts', 520, 1280, []);
    expect(added.length).toBeGreaterThan(0);
    expect(added[0]).toMatch(/^nahran-outskirts:\d+,\d+$/);
  });

  it('deactivates bandit patrol after mission cleared', () => {
    const patrol = NAHRAN_OUTSKIRTS.patrols!.find((p) => p.id === 'patrol-bandit-road')!;
    const hidden = { ...DEFAULT_SAVE, completedMissions: [] as string[] };
    expect(isOverworldPatrolActive(patrol, hidden)).toBe(false);

    const active = { ...hidden, completedMissions: ['mission-night-attack'] };
    expect(isOverworldPatrolActive(patrol, active)).toBe(true);

    const cleared = { ...active, completedMissions: ['mission-night-attack', 'mission-bandit-road'] };
    expect(isOverworldPatrolActive(patrol, cleared)).toBe(false);
  });

  it('returns quest hints based on progression', () => {
    const fresh = { ...DEFAULT_SAVE, completedMissions: [] as string[] };
    expect(getOverworldQuestHint(fresh)).toContain('Blacksmith');

    const ready = {
      ...fresh,
      recruitedHeroes: ['aisha'],
      unlockedBlueprints: ['arrow_tower', 'spike_trap'],
    };
    expect(getOverworldQuestHint(ready)).toContain('Nahran Gate');
    expect(getOverworldQuestHint({ ...ready, completedMissions: ['mission-night-attack'] })).toContain('Yusuf');
  });

  it('lists fast travel after oasis is visited', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      visitedOverworldPOIs: ['poi-silent-oasis'],
    };
    const destinations = getFastTravelDestinations(NAHRAN_OUTSKIRTS, save);
    expect(destinations.some((p) => p.id === 'poi-nahran-camp')).toBe(true);
    expect(destinations.some((p) => p.id === 'poi-silent-oasis')).toBe(true);
  });

  it('locks scorpion valley transition until silent oasis is saved', () => {
    const transition = NAHRAN_OUTSKIRTS.transitions!.find((t) => t.id === 'transition-to-scorpion-valley')!;
    const before = { ...DEFAULT_SAVE, completedMissions: ['mission-night-attack'] as string[] };
    expect(isRegionTransitionUnlocked(transition, before)).toBe(false);

    const after = { ...before, completedMissions: ['mission-night-attack', 'mission-silent-oasis'] };
    expect(isRegionTransitionUnlocked(transition, after)).toBe(true);
    expect(getActiveRegionTransitions(NAHRAN_OUTSKIRTS, after)).toHaveLength(1);
    expect(getRegionTransitionAtPoint(NAHRAN_OUTSKIRTS, 1290, 1600, after)?.targetRegionId).toBe('scorpion-valley');
  });

  it('hints valley progression after silent oasis', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack', 'mission-silent-oasis'] as string[],
      recruitedHeroes: ['aisha', 'yusuf'],
      unlockedBlueprints: ['arrow_tower', 'spike_trap'],
      visitedOverworldRegions: ['nahran-outskirts'],
    };
    expect(getOverworldQuestHint(save)).toContain('Scorpion Valley');
  });

  it('lists valley fast travel at camp hub', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-silent-oasis'],
      visitedOverworldRegions: ['nahran-outskirts', 'scorpion-valley'],
    };
    const destinations = getFastTravelDestinations(SCORPION_VALLEY, save);
    expect(destinations.some((p) => p.id === 'poi-valley-camp')).toBe(true);
  });
});
