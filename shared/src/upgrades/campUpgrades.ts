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
    name: 'Well Blessing',
    description: 'Oasis wells regenerate faster (+3 HP/sec per level)',
    maxLevel: 3,
    goldCost: 60,
    waterCost: 2,
    ironCost: 0,
    leatherCost: 0,
    woodCost: 0,
  },
  {
    id: 'war_camp',
    name: 'War Camp Training',
    description: 'Malik deals +5% damage per level on all missions',
    maxLevel: 5,
    goldCost: 80,
    waterCost: 0,
    ironCost: 1,
    leatherCost: 0,
    woodCost: 0,
  },
  {
    id: 'gate_workshop',
    name: 'Gate Workshop',
    description: 'Gates and wells gain +40 max HP per level',
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
    description: 'Wood reinforcements add +25 max HP to gates and wells per level',
    maxLevel: 4,
    goldCost: 45,
    waterCost: 0,
    ironCost: 0,
    leatherCost: 0,
    woodCost: 2,
  },
  {
    id: 'lion_den',
    name: 'Lion Den',
    description: 'Sahar respawns faster and roars more often',
    maxLevel: 3,
    goldCost: 100,
    waterCost: 1,
    ironCost: 0,
    leatherCost: 2,
    woodCost: 0,
  },
  {
    id: 'merchant_tents',
    name: 'Merchant Tents',
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
