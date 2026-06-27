import { describe, expect, it } from 'vitest';
import { canPlaceBuildType, getMissionPrepConfig, isPrepMission } from './missionPrep';

describe('missionPrep', () => {
  it('identifies Nahran prep missions', () => {
    expect(isPrepMission('mission-night-attack')).toBe(true);
    expect(isPrepMission('mission-shadow-emir')).toBe(false);
  });

  it('returns budgets for Night Attack', () => {
    const cfg = getMissionPrepConfig('mission-night-attack');
    expect(cfg?.startingGold).toBe(100);
    expect(cfg?.maxTowerBuilds).toBe(2);
    expect(cfg?.maxTrapBuilds).toBe(3);
  });

  it('enforces tower and trap slot limits', () => {
    const cfg = getMissionPrepConfig('mission-night-attack')!;
    expect(canPlaceBuildType('arrow_tower', 2, 0, cfg)).toBe(false);
    expect(canPlaceBuildType('spike_trap', 1, 3, cfg)).toBe(false);
    expect(canPlaceBuildType('spike_trap', 0, 1, cfg)).toBe(true);
  });
});
