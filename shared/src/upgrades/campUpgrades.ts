export interface CampUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  goldCost: number;
  waterCost: number;
  ironCost: number;
  leatherCost: number;
  woodCost: number;
}

export const CAMP_UPGRADES: CampUpgradeDefinition[] = [
  {
    id: 'well_blessing',
    name: 'Clean Water Jars',
    description: 'Improves camp recovery and stores safe drinking water.',
    maxLevel: 3,
    goldCost: 60,
    waterCost: 2,
    ironCost: 0,
    leatherCost: 0,
    woodCost: 0,
  },
  {
    id: 'war_camp',
    name: 'Training Yard',
    description: 'A practice space for Malik, hunters, and village guards.',
    maxLevel: 5,
    goldCost: 80,
    waterCost: 0,
    ironCost: 1,
    leatherCost: 0,
    woodCost: 0,
  },
  {
    id: 'gate_workshop',
    name: 'Workbench',
    description: 'A sturdy bench for repairing tools and preparing gear.',
    maxLevel: 5,
    goldCost: 70,
    waterCost: 0,
    ironCost: 2,
    leatherCost: 0,
    woodCost: 0,
  },
  {
    id: 'palm_timbers',
    name: 'Palm Timbers',
    description: 'Palm wood storage for camp repairs, cooking fires, and crafting.',
    maxLevel: 4,
    goldCost: 45,
    waterCost: 0,
    ironCost: 0,
    leatherCost: 0,
    woodCost: 2,
  },
  {
    id: 'lion_den',
    name: 'Companion Shelter',
    description: 'A shaded shelter reserved for future companions.',
    maxLevel: 3,
    goldCost: 100,
    waterCost: 1,
    ironCost: 0,
    leatherCost: 2,
    woodCost: 0,
  },
  {
    id: 'merchant_tents',
    name: 'Vendor Tents',
    description: 'Shop items cost 10% less gold per level',
    maxLevel: 3,
    goldCost: 50,
    waterCost: 0,
    ironCost: 0,
    leatherCost: 1,
    woodCost: 0,
  },
];

export function getCampUpgrade(id: string): CampUpgradeDefinition | undefined {
  return CAMP_UPGRADES.find((u) => u.id === id);
}
