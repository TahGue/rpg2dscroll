import type { LocalSaveData } from '../types/save';
import type { MissionPrepConfig } from '../missions/missionPrep';

export interface DefenseSkillDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  /** Gold cost per level (index = current level). */
  costs: number[];
  /** Human-readable effect summary per level. */
  effectLabel: string;
}

export const DEFENSE_SKILLS: DefenseSkillDefinition[] = [
  {
    id: 'cheaper_towers',
    name: 'Frugal Builder',
    description: 'Spend less mission gold when placing towers and traps.',
    maxLevel: 3,
    costs: [40, 80, 140],
    effectLabel: '-8% build gold cost per level',
  },
  {
    id: 'repair_boost',
    name: 'Field Repair',
    description: 'Repair gates and objectives faster during defense.',
    maxLevel: 3,
    costs: [35, 70, 120],
    effectLabel: '+10% repair speed per level',
  },
  {
    id: 'extra_supplies',
    name: 'Quartermaster',
    description: 'Start prep missions with extra battle supplies.',
    maxLevel: 3,
    costs: [50, 90, 150],
    effectLabel: '+20 gold, +2 wood, +1 iron per level',
  },
];

export function getDefenseSkillLevel(save: Pick<LocalSaveData, 'defenseSkills'>, skillId: string): number {
  return save.defenseSkills[skillId] ?? 0;
}

export function getDefenseSkillCost(def: DefenseSkillDefinition, currentLevel: number): number {
  if (currentLevel >= def.maxLevel) return 0;
  return def.costs[currentLevel] ?? def.costs[def.costs.length - 1]!;
}

export function getBuildGoldDiscount(save: Pick<LocalSaveData, 'defenseSkills'>): number {
  const level = getDefenseSkillLevel(save, 'cheaper_towers');
  return level * 0.08;
}

export function getDefenseRepairMultiplier(save: Pick<LocalSaveData, 'defenseSkills'>): number {
  const level = getDefenseSkillLevel(save, 'repair_boost');
  return 1 + level * 0.1;
}

export function applyDefenseSkillPrepBonus(
  config: MissionPrepConfig,
  save: Pick<LocalSaveData, 'defenseSkills'>,
): MissionPrepConfig {
  const supplies = getDefenseSkillLevel(save, 'extra_supplies');
  if (supplies <= 0) return config;
  return {
    ...config,
    startingGold: config.startingGold + supplies * 20,
    startingWood: config.startingWood + supplies * 2,
    startingIron: config.startingIron + supplies * 1,
  };
}
