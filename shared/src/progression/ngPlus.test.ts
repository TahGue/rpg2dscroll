import { describe, expect, it } from 'vitest';
import { getNgPlusMultiplier, getNgPlusRewardMultiplier } from './ngPlus';
import { applyNgPlusReset } from './ngPlusReset';
import { DEFAULT_SAVE } from '../types/save';

describe('ngPlus scaling', () => {
  it('starts at 1x enemy difficulty', () => {
    expect(getNgPlusMultiplier(0)).toBe(1);
    expect(getNgPlusRewardMultiplier(0)).toBe(1);
  });

  it('scales enemies +25% per NG+ level', () => {
    expect(getNgPlusMultiplier(2)).toBe(1.5);
  });

  it('scales rewards +10% per NG+ level', () => {
    expect(getNgPlusRewardMultiplier(3)).toBe(1.3);
  });

  it('resets mission progress but keeps upgrades on NG+', () => {
    const save = {
      ...DEFAULT_SAVE,
      ngPlusLevel: 1,
      gold: 500,
      completedMissions: ['mission-night-attack', 'mission-silent-oasis'],
      unlockedMissions: [...DEFAULT_SAVE.unlockedMissions, 'silent-oasis', 'red-dune-pass'],
      collectedResources: ['wood-grove'],
      upgrades: { ...DEFAULT_SAVE.upgrades, sword_damage: 3 },
      campaignComplete: true,
      recruitedHeroes: ['aisha', 'salim'],
    };
    const next = applyNgPlusReset(save);
    expect(next.ngPlusLevel).toBe(2);
    expect(next.gold).toBeGreaterThan(save.gold);
    expect(next.completedMissions).toEqual([]);
    expect(next.collectedResources).toEqual([]);
    expect(next.upgrades.sword_damage).toBe(3);
    expect(next.campaignComplete).toBe(true);
    expect(next.overworldPosition.regionId).toBe('nahran-outskirts');
    expect(next.visitedOverworldRegions).toEqual(['nahran-outskirts']);
    expect(next.exploredOverworldCells).toEqual([]);
    expect(next.recruitedHeroes).toEqual(['aisha', 'salim']);
  });
});
