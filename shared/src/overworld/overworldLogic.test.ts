import { describe, it, expect } from 'vitest';
import { DEFAULT_SAVE } from '../types/save';
import {
  getActiveOverworldPOIs,
  getActiveOverworldWalls,
  getNewExploredCellsNearPoint,
  getOverworldCampaignProgress,
  getCampaignNextGoal,
  getOverworldQuestHint,
  getFastTravelDestinations,
  isOverworldPatrolActive,
  isOverworldPOIVisible,
  isOverworldPOIUnlocked,
} from './overworldLogic';
import { SCORPION_VALLEY } from './scorpionValley';
import { BLACK_ECLIPSE_RIM } from './blackEclipseRim';
import {
  getAllFastTravelDestinations,
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

  it('deactivates patrol when marked defeated', () => {
    const patrol = NAHRAN_OUTSKIRTS.patrols!.find((p) => p.id === 'patrol-bandit-road')!;
    const active = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      defeatedOverworldPatrols: [] as string[],
    };
    expect(isOverworldPatrolActive(patrol, active)).toBe(true);

    const defeated = { ...active, defeatedOverworldPatrols: ['patrol-bandit-road'] };
    expect(isOverworldPatrolActive(patrol, defeated)).toBe(false);
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

  it('suggests optional bandit road after silent oasis path begins', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack', 'mission-silent-oasis'] as string[],
      recruitedHeroes: ['aisha', 'yusuf'],
      unlockedBlueprints: ['arrow_tower', 'spike_trap'],
      visitedOverworldRegions: ['nahran-outskirts'],
    };
    expect(getOverworldQuestHint(save)).toContain('Bandit Road');
  });

  it('reveals leather cache after bandit road', () => {
    const save = { ...DEFAULT_SAVE, completedMissions: ['mission-bandit-road'] };
    const cache = NAHRAN_OUTSKIRTS.pois.find((p) => p.id === 'poi-leather-cache')!;
    expect(isOverworldPOIVisible(cache, save)).toBe(true);
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
      completedMissions: ['mission-night-attack', 'mission-silent-oasis', 'mission-bandit-road', 'mission-caravan-escort'] as string[],
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

  it('lists cross-region fast travel from visited regions', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack'],
      visitedOverworldPOIs: ['poi-silent-oasis', 'poi-valley-camp'],
      visitedOverworldRegions: ['nahran-outskirts', 'scorpion-valley'],
    };
    const all = getAllFastTravelDestinations(save);
    expect(all.some((d) => d.poi.id === 'poi-nahran-camp')).toBe(true);
    expect(all.some((d) => d.poi.id === 'poi-valley-camp')).toBe(true);
  });

  it('reveals sandstorm gate after silent oasis', () => {
    const save = { ...DEFAULT_SAVE, completedMissions: ['mission-night-attack', 'mission-silent-oasis'] };
    const gate = NAHRAN_OUTSKIRTS.pois.find((p) => p.id === 'poi-sandstorm-gate')!;
    expect(isOverworldPOIVisible(gate, save)).toBe(true);
  });

  it('reveals sentinel shrine after watchtower', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-scorpion-nest', 'mission-broken-watchtower'],
    };
    const shrine = SCORPION_VALLEY.pois.find((p) => p.id === 'poi-sentinel-shrine')!;
    expect(isOverworldPOIVisible(shrine, save)).toBe(true);
    expect(isOverworldPOIUnlocked(shrine, save)).toBe(true);
  });

  it('locks eclipse rim transition until shrine sanctum', () => {
    const transition = SCORPION_VALLEY.transitions!.find((t) => t.id === 'transition-to-eclipse-rim')!;
    const before = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-scorpion-nest', 'mission-broken-watchtower'] as string[],
    };
    expect(isRegionTransitionUnlocked(transition, before)).toBe(false);

    const after = { ...before, completedMissions: [...before.completedMissions, 'mission-shrine-sanctum'] };
    expect(isRegionTransitionUnlocked(transition, after)).toBe(true);
    expect(getRegionTransitionAtPoint(SCORPION_VALLEY, 1920, 900, after)?.targetRegionId).toBe(
      'black-eclipse-rim',
    );
  });

  it('hints eclipse finale after shrine', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: [
        'mission-night-attack',
        'mission-silent-oasis',
        'mission-bandit-road',
        'mission-caravan-escort',
        'mission-scorpion-nest',
        'mission-broken-watchtower',
        'mission-shrine-sanctum',
      ] as string[],
      recruitedHeroes: ['aisha', 'yusuf', 'hamza', 'salim'],
      unlockedBlueprints: ['arrow_tower', 'spike_trap', 'iron_tower'],
      visitedOverworldRegions: ['nahran-outskirts', 'scorpion-valley'],
    };
    expect(getOverworldQuestHint(save)).toContain('Black Eclipse Rim');
  });

  it('hints NG+ after campaign complete', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-shadow-emir'],
      campaignComplete: true,
      recruitedHeroes: ['aisha'],
      unlockedBlueprints: ['arrow_tower'],
      visitedOverworldRegions: ['nahran-outskirts'],
    };
    expect(getOverworldQuestHint(save)).toContain('New Game+');
  });

  it('lists eclipse outpost for fast travel', () => {
    const save = {
      ...DEFAULT_SAVE,
      visitedOverworldRegions: ['nahran-outskirts', 'black-eclipse-rim'],
    };
    const destinations = getFastTravelDestinations(BLACK_ECLIPSE_RIM, save);
    expect(destinations.some((p) => p.id === 'poi-eclipse-outpost')).toBe(true);
  });
});

describe('getOverworldCampaignProgress', () => {
  it('starts at act I with zero main-path steps', () => {
    const progress = getOverworldCampaignProgress(DEFAULT_SAVE);
    expect(progress.completedSteps).toBe(0);
    expect(progress.totalSteps).toBe(10);
    expect(progress.chapterTitle).toBe('Act I');
    expect(progress.percent).toBe(0);
  });

  it('advances through act II after silent oasis', () => {
    const progress = getOverworldCampaignProgress({
      ...DEFAULT_SAVE,
      recruitedHeroes: ['aisha'],
      completedMissions: ['mission-night-attack', 'mission-silent-oasis'],
    });
    expect(progress.completedSteps).toBe(3);
    expect(progress.chapterTitle).toBe('Act II');
    expect(progress.percent).toBe(30);
  });

  it('marks complete at 100% after shadow emir', () => {
    const progress = getOverworldCampaignProgress({
      ...DEFAULT_SAVE,
      recruitedHeroes: ['aisha', 'yusuf', 'hamza', 'salim'],
      completedMissions: [
        'mission-night-attack',
        'mission-silent-oasis',
        'mission-scorpion-nest',
        'mission-broken-watchtower',
        'mission-shrine-sanctum',
        'mission-black-eclipse',
        'mission-shadow-emir',
      ],
      visitedOverworldRegions: ['nahran-outskirts', 'scorpion-valley', 'black-eclipse-rim'],
      campaignComplete: true,
    });
    expect(progress.completedSteps).toBe(10);
    expect(progress.percent).toBe(100);
    expect(progress.chapterTitle).toBe('Complete');
  });
});

describe('getCampaignNextGoal', () => {
  it('returns overworld hint for desert return', () => {
    const save = {
      ...DEFAULT_SAVE,
      recruitedHeroes: ['aisha'],
      unlockedBlueprints: ['arrow_tower', 'spike_trap'],
    };
    expect(getCampaignNextGoal(save, 'world_explore')).toContain('Nahran Gate');
  });

  it('returns node map location for map return', () => {
    const save = {
      ...DEFAULT_SAVE,
      unlockedMissions: ['mission-night-attack'],
      completedMissions: [] as string[],
    };
    expect(getCampaignNextGoal(save, 'world_map')).toContain('Night Attack');
  });

  it('returns null when campaign is complete', () => {
    expect(getCampaignNextGoal({ ...DEFAULT_SAVE, campaignComplete: true }, 'world_explore')).toBeNull();
  });
});
