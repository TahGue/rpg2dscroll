import { mergeSaveData, type LocalSaveData } from '../types/save';

function maxRecord(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, number> = {};
  for (const key of keys) {
    out[key] = Math.max(a[key] ?? 0, b[key] ?? 0);
  }
  return out;
}

function union(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

/** Combine local and cloud saves, keeping the best progress from each. */
export function mergeCloudSaves(local: Partial<LocalSaveData>, cloud: Partial<LocalSaveData>): LocalSaveData {
  const a = mergeSaveData(local);
  const b = mergeSaveData(cloud);

  const mergedBestScores = { ...a.bestScores };
  for (const [id, score] of Object.entries(b.bestScores)) {
    mergedBestScores[id] = Math.max(mergedBestScores[id] ?? 0, score);
  }

  return mergeSaveData({
    ...a,
    gold: Math.max(a.gold, b.gold),
    water: Math.max(a.water, b.water),
    iron: Math.max(a.iron, b.iron),
    leather: Math.max(a.leather, b.leather),
    wood: Math.max(a.wood, b.wood),
    xp: Math.max(a.xp, b.xp),
    level: Math.max(a.level, b.level),
    ngPlusLevel: Math.max(a.ngPlusLevel, b.ngPlusLevel),
    completedMissions: union(a.completedMissions, b.completedMissions),
    unlockedMissions: union(a.unlockedMissions, b.unlockedMissions),
    achievements: union(a.achievements, b.achievements),
    unlockedLore: union(a.unlockedLore, b.unlockedLore),
    collectedResources: union(a.collectedResources, b.collectedResources),
    seenActs: union(a.seenActs, b.seenActs),
    bestScores: mergedBestScores,
    upgrades: maxRecord(a.upgrades, b.upgrades),
    campUpgrades: maxRecord(a.campUpgrades, b.campUpgrades),
    relicLevels: maxRecord(a.relicLevels, b.relicLevels),
    inventory: maxRecord(a.inventory, b.inventory),
    campaignComplete: a.campaignComplete || b.campaignComplete,
    seenCampDialog: a.seenCampDialog || b.seenCampDialog,
    restBonusActive: a.restBonusActive || b.restBonusActive,
    missionBoost: a.missionBoost ?? b.missionBoost,
    settings: a.settings,
    lastPlayedAt: a.lastPlayedAt > b.lastPlayedAt ? a.lastPlayedAt : b.lastPlayedAt,
  });
}
