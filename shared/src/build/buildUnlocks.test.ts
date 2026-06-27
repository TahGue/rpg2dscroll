import { describe, expect, it } from 'vitest';
import {
  cycleBuildChoice,
  getBuildUnlocksGrantedByMission,
  getUnlockedBuildIds,
  isBuildUnlocked,
} from './buildUnlocks';

const baseCtx = {
  completedMissions: [] as string[],
  lionLevel: 0,
  lionDenCampLevel: 0,
  unlockedBlueprints: ['arrow_tower', 'spike_trap'],
};

describe('buildUnlocks', () => {
  it('starts with arrow tower when only default blueprint exists', () => {
    expect(getUnlockedBuildIds({ ...baseCtx, unlockedBlueprints: ['arrow_tower'] })).toEqual(['arrow_tower']);
  });

  it('includes discovered blueprints', () => {
    expect(getUnlockedBuildIds(baseCtx)).toEqual(['arrow_tower', 'spike_trap']);
  });

  it('unlocks barricade after Red Dune Pass', () => {
    const ctx = { ...baseCtx, completedMissions: ['mission-red-dune-pass'] };
    expect(isBuildUnlocked('barricade', ctx)).toBe(true);
    expect(isBuildUnlocked('iron_tower', ctx)).toBe(false);
  });

  it('unlocks repair station after Silent Oasis', () => {
    const ctx = { ...baseCtx, completedMissions: ['mission-silent-oasis'] };
    expect(isBuildUnlocked('repair_station', ctx)).toBe(true);
  });

  it('unlocks iron tower after Broken Watchtower', () => {
    const ctx = { ...baseCtx, completedMissions: ['mission-broken-watchtower'] };
    expect(isBuildUnlocked('iron_tower', ctx)).toBe(true);
  });

  it('unlocks lion den with lion and camp upgrades', () => {
    const ctx = { ...baseCtx, lionLevel: 1, lionDenCampLevel: 1 };
    expect(isBuildUnlocked('lion_den', ctx)).toBe(true);
  });

  it('cycles through unlocked builds only', () => {
    const ctx = {
      ...baseCtx,
      completedMissions: ['mission-red-dune-pass', 'mission-silent-oasis'],
    };
    expect(cycleBuildChoice('arrow_tower', ctx)).toBe('spike_trap');
    expect(cycleBuildChoice('spike_trap', ctx)).toBe('barricade');
    expect(cycleBuildChoice('barricade', ctx)).toBe('repair_station');
    expect(cycleBuildChoice('repair_station', ctx)).toBe('arrow_tower');
  });

  it('maps build unlocks to missions', () => {
    expect(getBuildUnlocksGrantedByMission('mission-red-dune-pass')).toEqual(['barricade']);
    expect(getBuildUnlocksGrantedByMission('mission-silent-oasis')).toEqual(['repair_station']);
  });
});
