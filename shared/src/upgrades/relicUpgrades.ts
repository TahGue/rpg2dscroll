export interface RelicUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  goldCost: number;
  waterCost: number;
  unlockRequirement?: string;
}

export const RELIC_UPGRADES: RelicUpgradeDefinition[] = [
  {
    id: 'sand_shield',
    name: 'Sand Shield',
    description: 'Blocking reduces +10% damage per level',
    maxLevel: 3,
    goldCost: 120,
    waterCost: 2,
    unlockRequirement: 'mission-shrine-sanctum',
  },
  {
    id: 'sun_strike',
    name: 'Sun Strike',
    description: 'Unlock War Cry (T) — stuns nearby enemies',
    maxLevel: 1,
    goldCost: 150,
    waterCost: 3,
    unlockRequirement: 'mission-shrine-sanctum',
  },
  {
    id: 'sentinel_shield',
    name: 'Sentinel Shield',
    description: 'Unlock Sentinel Shield (G) — brief invulnerability',
    maxLevel: 1,
    goldCost: 180,
    waterCost: 2,
    unlockRequirement: 'mission-broken-watchtower',
  },
  {
    id: 'healing_wind',
    name: 'Healing Wind',
    description: 'Regenerate 2 HP/sec while blocking per level',
    maxLevel: 3,
    goldCost: 90,
    waterCost: 4,
    unlockRequirement: 'mission-shrine-sanctum',
  },
  {
    id: 'eclipse_ward',
    name: 'Eclipse Ward',
    description: 'Take -8% damage per level in boss missions',
    maxLevel: 3,
    goldCost: 100,
    waterCost: 1,
    unlockRequirement: 'mission-black-eclipse',
  },
];

export function getRelicUpgrade(id: string): RelicUpgradeDefinition | undefined {
  return RELIC_UPGRADES.find((r) => r.id === id);
}

export function isRelicUnlocked(relicId: string, completedMissions: string[]): boolean {
  const def = getRelicUpgrade(relicId);
  if (!def?.unlockRequirement) return true;
  return completedMissions.includes(def.unlockRequirement);
}
