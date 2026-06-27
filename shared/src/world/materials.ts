import type { LocalSaveData } from '../types/save';

/** Inventory item id → save material field */
export const MATERIAL_INVENTORY_MAP = {
  iron_ingot: 'iron',
  leather_hide: 'leather',
} as const satisfies Record<string, keyof Pick<LocalSaveData, 'iron' | 'leather'>>;

export type MaterialInventoryId = keyof typeof MATERIAL_INVENTORY_MAP;

export function syncMaterialsToInventory(
  save: Pick<LocalSaveData, 'iron' | 'leather' | 'inventory'>,
): LocalSaveData['inventory'] {
  return {
    ...save.inventory,
    iron_ingot: save.iron,
    leather_hide: save.leather,
  };
}

export function addMaterialRewards(
  save: Pick<LocalSaveData, 'iron' | 'leather' | 'wood' | 'inventory'>,
  rewards: { iron?: number; leather?: number; wood?: number },
): Pick<LocalSaveData, 'iron' | 'leather' | 'wood' | 'inventory'> {
  const iron = save.iron + (rewards.iron ?? 0);
  const leather = save.leather + (rewards.leather ?? 0);
  const wood = save.wood + (rewards.wood ?? 0);
  return {
    iron,
    leather,
    wood,
    inventory: {
      ...save.inventory,
      iron_ingot: iron,
      leather_hide: leather,
    },
  };
}
