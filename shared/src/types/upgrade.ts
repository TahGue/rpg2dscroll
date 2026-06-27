export type UpgradeCategory = 'malik' | 'gate' | 'lion' | 'base';

export interface UpgradeDefinition {
  id: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
}
