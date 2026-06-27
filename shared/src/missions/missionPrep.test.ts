import { describe, expect, it } from 'vitest';
import { canPlaceBuildType, getMissionPrepConfig, isPrepMission } from './missionPrep';

describe('missionPrep', () => {
  it('identifies Nahran prep missions', () => {
    expect(isPrepMission('mission-night-attack')).toBe(true);
    expect(isPrepMission('mission-scorpion-nest')).toBe(true);
    expect(isPrepMission('mission-shadow-emir')).toBe(true);
  });

  it('returns budgets for Night Attack', () => {
    const cfg = getMissionPrepConfig('mission-night-attack');
    expect(cfg?.startingGold).toBe(100);
    expect(cfg?.maxTowerBuilds).toBe(2);
    expect(cfg?.maxTrapBuilds).toBe(3);
  });

  it('returns trap-heavy budget for Scorpion Nest', () => {
    const cfg = getMissionPrepConfig('mission-scorpion-nest');
    expect(cfg?.maxTrapBuilds).toBe(4);
    expect(cfg?.startingIron).toBe(8);
  });

  it('returns iron-heavy budget for Broken Watchtower', () => {
    const cfg = getMissionPrepConfig('mission-broken-watchtower');
    expect(cfg?.maxTowerBuilds).toBe(3);
    expect(cfg?.startingIron).toBe(12);
  });

  it('returns finale prep budget for Shadow Emir', () => {
    const cfg = getMissionPrepConfig('mission-shadow-emir');
    expect(cfg?.startingGold).toBe(300);
    expect(cfg?.maxTowerBuilds).toBe(4);
  });

  it('returns prep for Red Dune Pass and Caravan Escort', () => {
    expect(isPrepMission('mission-red-dune-pass')).toBe(true);
    expect(isPrepMission('mission-caravan-escort')).toBe(true);
    expect(getMissionPrepConfig('mission-red-dune-pass')?.startingWood).toBe(12);
  });

  it('enforces tower and trap slot limits', () => {
    const cfg = getMissionPrepConfig('mission-night-attack')!;
    expect(canPlaceBuildType('arrow_tower', 2, 0, cfg)).toBe(false);
    expect(canPlaceBuildType('fire_tower', 2, 0, cfg)).toBe(false);
    expect(canPlaceBuildType('spike_trap', 1, 3, cfg)).toBe(false);
    expect(canPlaceBuildType('poison_trap', 1, 3, cfg)).toBe(false);
    expect(canPlaceBuildType('spike_trap', 0, 1, cfg)).toBe(true);
    expect(canPlaceBuildType('stone_wall', 2, 3, cfg)).toBe(true);
  });
});
