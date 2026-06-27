import { DEFAULT_SAVE, type LocalSaveData } from '../types/save';

/** Apply NG+ cycle: harder enemies, mission map reset, keep upgrades and meta progress. */
export function applyNgPlusReset(save: LocalSaveData): LocalSaveData {
  const ngPlusLevel = save.ngPlusLevel + 1;
  const bonusGold = 100 * ngPlusLevel;

  return {
    ...save,
    ngPlusLevel,
    gold: save.gold + bonusGold,
    completedMissions: [],
    unlockedMissions: [...DEFAULT_SAVE.unlockedMissions],
    collectedResources: [],
    restBonusActive: false,
    missionBoost: null,
    campaignComplete: true,
  };
}
