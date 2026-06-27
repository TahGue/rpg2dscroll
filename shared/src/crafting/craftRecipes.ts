export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  ironCost?: number;
  leatherCost?: number;
  woodCost?: number;
  inventoryCosts?: Record<string, number>;
  outputItemId: string;
  outputQuantity: number;
  requiresCompletedMission?: string;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft-dates',
    name: 'Date Rations',
    description: 'Trail food from leather and palm wood',
    leatherCost: 2,
    woodCost: 1,
    outputItemId: 'dates',
    outputQuantity: 1,
  },
  {
    id: 'craft-ointment',
    name: 'Desert Ointment',
    description: 'Salve for gate repairs',
    ironCost: 1,
    leatherCost: 1,
    outputItemId: 'ointment',
    outputQuantity: 1,
  },
  {
    id: 'craft-firestones',
    name: 'Fire Stones',
    description: 'Volatile stones for battle',
    ironCost: 2,
    woodCost: 2,
    outputItemId: 'firestones',
    outputQuantity: 1,
  },
  {
    id: 'craft-relic-shard',
    name: 'Relic Shard',
    description: 'Forge a shard of First Sentinel power',
    ironCost: 3,
    leatherCost: 2,
    woodCost: 2,
    outputItemId: 'relic_shard',
    outputQuantity: 1,
    requiresCompletedMission: 'mission-broken-watchtower',
  },
];

export function getCraftRecipe(id: string): CraftRecipe | undefined {
  return CRAFT_RECIPES.find((r) => r.id === id);
}

export function formatRecipeCost(recipe: CraftRecipe): string {
  const parts: string[] = [];
  if (recipe.ironCost) parts.push(`${recipe.ironCost} iron`);
  if (recipe.leatherCost) parts.push(`${recipe.leatherCost} leather`);
  if (recipe.woodCost) parts.push(`${recipe.woodCost} wood`);
  if (recipe.inventoryCosts) {
    for (const [id, qty] of Object.entries(recipe.inventoryCosts)) {
      parts.push(`${qty} ${id.replace(/_/g, ' ')}`);
    }
  }
  return parts.join(' · ') || 'Free';
}
