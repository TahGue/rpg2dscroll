export type MissionBoostType = 'hp' | 'damage' | 'repair';

export interface ShopItemDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  boost?: MissionBoostType;
  vendor: 'merchant' | 'blacksmith' | 'herbalist' | 'fisherman' | 'hunter';
}

export const SHOP_ITEMS: ShopItemDefinition[] = [
  {
    id: 'dates',
    name: 'Dates',
    description: 'Trail food that restores a little health and stamina.',
    cost: 8,
    vendor: 'merchant',
  },
  {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'Restores Malik health during exploration.',
    cost: 32,
    vendor: 'herbalist',
  },
  {
    id: 'arrows',
    name: 'Arrow',
    description: 'Ammunition for Malik\'s bow.',
    cost: 18,
    vendor: 'hunter',
  },
  {
    id: 'rope',
    name: 'Rope',
    description: 'Crafting material for tools and torches.',
    cost: 12,
    vendor: 'merchant',
  },
  {
    id: 'fishing_rod',
    name: 'Fishing Rod',
    description: 'Tool for catching oasis fish.',
    cost: 45,
    vendor: 'fisherman',
  },
  {
    id: 'hunting_knife',
    name: 'Hunting Knife',
    description: 'Tool for harvesting hides from hunted game.',
    cost: 55,
    vendor: 'hunter',
  },
];

export function getShopItem(id: string): ShopItemDefinition | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
