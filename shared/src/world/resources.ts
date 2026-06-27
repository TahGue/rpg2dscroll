export interface ResourceNodeDefinition {
  locationId: string;
  goldReward: number;
  waterReward: number;
  ironReward: number;
  leatherReward: number;
  woodReward: number;
  loreId: string;
}

export const RESOURCE_NODES: Record<string, ResourceNodeDefinition> = {
  'hidden-cistern': {
    locationId: 'hidden-cistern',
    goldReward: 75,
    waterReward: 1,
    ironReward: 0,
    leatherReward: 0,
    woodReward: 0,
    loreId: 'lore-hidden-cistern',
  },
  'iron-vein': {
    locationId: 'iron-vein',
    goldReward: 40,
    waterReward: 0,
    ironReward: 3,
    leatherReward: 0,
    woodReward: 0,
    loreId: 'lore-iron-veins',
  },
  'leather-cache': {
    locationId: 'leather-cache',
    goldReward: 30,
    waterReward: 0,
    ironReward: 0,
    leatherReward: 3,
    woodReward: 0,
    loreId: 'lore-leather-trade',
  },
  'wood-grove': {
    locationId: 'wood-grove',
    goldReward: 25,
    waterReward: 0,
    ironReward: 0,
    leatherReward: 0,
    woodReward: 4,
    loreId: 'lore-oasis-palms',
  },
};

export function getResourceNode(locationId: string): ResourceNodeDefinition | undefined {
  return RESOURCE_NODES[locationId];
}

export interface ResourceRewards {
  gold: number;
  water: number;
  iron: number;
  leather: number;
  wood: number;
  loreId: string;
}
