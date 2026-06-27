export type MissionBoostType = 'hp' | 'damage' | 'repair';

export interface ShopItemDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  boost: MissionBoostType;
}

export const SHOP_ITEMS: ShopItemDefinition[] = [
  {
    id: 'dates',
    name: 'Date Rations',
    description: '+25% Malik HP on your next mission',
    cost: 40,
    boost: 'hp',
  },
  {
    id: 'ointment',
    name: 'Desert Ointment',
    description: '2× gate/caravan repair speed on your next mission',
    cost: 35,
    boost: 'repair',
  },
  {
    id: 'firestones',
    name: 'Fire Stones',
    description: '+20% Malik damage on your next mission',
    cost: 45,
    boost: 'damage',
  },
];

export function getShopItem(id: string): ShopItemDefinition | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
