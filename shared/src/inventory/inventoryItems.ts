export interface InventoryItemDefinition {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'material';
}

export const INVENTORY_ITEMS: InventoryItemDefinition[] = [
  { id: 'dates', name: 'Date Rations', description: '+25% HP next mission', category: 'consumable' },
  { id: 'ointment', name: 'Desert Ointment', description: '2× repair speed next mission', category: 'consumable' },
  { id: 'firestones', name: 'Fire Stones', description: '+20% damage next mission', category: 'consumable' },
  { id: 'iron_ingot', name: 'Iron Ingot', description: 'Crafting material for camp upgrades', category: 'material' },
  { id: 'leather_hide', name: 'Leather Hide', description: 'Crafting material for camp gear', category: 'material' },
  { id: 'relic_shard', name: 'Relic Shard', description: 'Fragment of First Sentinel power', category: 'material' },
];

export function getInventoryItem(id: string): InventoryItemDefinition | undefined {
  return INVENTORY_ITEMS.find((i) => i.id === id);
}
