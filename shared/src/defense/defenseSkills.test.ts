import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVE } from '../types/save';
import {
  applyDefenseSkillPrepBonus,
  getBuildGoldDiscount,
  getDefenseRepairMultiplier,
  getDefenseSkillCost,
} from './defenseSkills';
import { getMissionPrepConfig } from '../missions/missionPrep';

describe('defenseSkills', () => {
  it('applies cheaper tower discount', () => {
    const save = { ...DEFAULT_SAVE, defenseSkills: { ...DEFAULT_SAVE.defenseSkills, cheaper_towers: 2 } };
    expect(getBuildGoldDiscount(save)).toBeCloseTo(0.16);
  });

  it('boosts repair rate', () => {
    const save = { ...DEFAULT_SAVE, defenseSkills: { ...DEFAULT_SAVE.defenseSkills, repair_boost: 3 } };
    expect(getDefenseRepairMultiplier(save)).toBe(1.3);
  });

  it('adds extra prep supplies', () => {
    const base = getMissionPrepConfig('mission-night-attack')!;
    const save = { ...DEFAULT_SAVE, defenseSkills: { ...DEFAULT_SAVE.defenseSkills, extra_supplies: 2 } };
    const boosted = applyDefenseSkillPrepBonus(base, save);
    expect(boosted.startingGold).toBe(base.startingGold + 40);
    expect(boosted.startingWood).toBe(base.startingWood + 4);
  });

  it('returns skill upgrade cost by level', () => {
    expect(getDefenseSkillCost({ id: 'x', name: 'x', description: 'x', maxLevel: 3, costs: [10, 20, 30], effectLabel: '' }, 0)).toBe(10);
    expect(getDefenseSkillCost({ id: 'x', name: 'x', description: 'x', maxLevel: 3, costs: [10, 20, 30], effectLabel: '' }, 2)).toBe(30);
  });
});
