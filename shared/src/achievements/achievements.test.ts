import { describe, expect, it } from 'vitest';
import { checkMetaAchievements, checkNewAchievements } from './achievements';

const baseSave = {
  achievements: [] as string[],
  level: 1,
  gold: 0,
  upgrades: {} as Record<string, number>,
  completedMissions: [] as string[],
  collectedResources: [] as string[],
  ngPlusLevel: 0,
};

describe('checkMetaAchievements', () => {
  it('grants lion tamer when lion is unlocked', () => {
    const ids = checkMetaAchievements({
      ...baseSave,
      upgrades: { lion_level: 1 },
    });
    expect(ids).toContain('lion_tamer');
  });

  it('grants gold hoarder at 500 gold', () => {
    const ids = checkMetaAchievements({ ...baseSave, gold: 500 });
    expect(ids).toContain('gold_hoarder');
  });

  it('grants ng plus hero when ngPlusLevel >= 1', () => {
    const ids = checkMetaAchievements({ ...baseSave, ngPlusLevel: 1 });
    expect(ids).toContain('ng_plus_hero');
  });

  it('grants resource hoarder when all nodes collected', () => {
    const ids = checkMetaAchievements({
      ...baseSave,
      collectedResources: ['hidden-cistern', 'iron-vein', 'leather-cache', 'wood-grove'],
    });
    expect(ids).toContain('resource_hoarder');
  });
});

describe('checkNewAchievements mission context', () => {
  it('grants boss slayer when dune scorpion is killed', () => {
    const ids = checkNewAchievements(baseSave, {
      victory: true,
      missionId: 'mission-broken-watchtower',
      gateHpRemaining: 400,
      gateMaxHp: 500,
      elapsedMs: 60_000,
      parTimeMs: 360_000,
      enemiesKilled: 10,
      bossesKilled: ['dune_scorpion'],
    });
    expect(ids).toContain('boss_slayer');
  });
});
