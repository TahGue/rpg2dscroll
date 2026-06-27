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
    id: 'craft-healing-potion',
    name: 'Healing Potion',
    description: 'Brew medicine for wounds and village sickness.',
    inventoryCosts: { healing_herb: 2, water_flask: 1 },
    outputItemId: 'healing_potion',
    outputQuantity: 1,
  },
  {
    id: 'craft-big-healing-potion',
    name: 'Big Healing Potion',
    description: 'Stronger medicine for the boss road.',
    inventoryCosts: { healing_potion: 1, desert_mint: 2, water_flask: 1 },
    outputItemId: 'big_healing_potion',
    outputQuantity: 1,
  },
  {
    id: 'craft-herb-tea',
    name: 'Herb Tea',
    description: 'A simple restorative drink brewed at camp.',
    inventoryCosts: { healing_herb: 1, desert_mint: 1, water_flask: 1 },
    outputItemId: 'herb_tea',
    outputQuantity: 1,
  },
  {
    id: 'craft-arrows',
    name: 'Arrows x10',
    description: 'Simple arrows for hunting and road fights.',
    inventoryCosts: { palm_wood: 2, feather: 1, stone: 1 },
    outputItemId: 'arrows',
    outputQuantity: 10,
  },
  {
    id: 'craft-rope',
    name: 'Rope',
    description: 'Twist palm fibers into usable rope.',
    inventoryCosts: { palm_wood: 1, thread: 1 },
    outputItemId: 'rope',
    outputQuantity: 1,
  },
  {
    id: 'craft-simple-spear',
    name: 'Simple Spear',
    description: 'A long desert spear for beasts and bandits.',
    inventoryCosts: { palm_wood: 3, stone: 2, rope: 1 },
    outputItemId: 'simple_spear',
    outputQuantity: 1,
  },
  {
    id: 'craft-hunter-bow',
    name: 'Hunter Bow',
    description: 'A basic bow for cautious approaches.',
    inventoryCosts: { palm_wood: 4, rope: 2, hide: 1 },
    outputItemId: 'bow',
    outputQuantity: 1,
  },
  {
    id: 'craft-grilled-fish',
    name: 'Grilled Fish',
    description: 'Cook fish over the campfire.',
    inventoryCosts: { small_oasis_fish: 1 },
    outputItemId: 'grilled_fish',
    outputQuantity: 1,
  },
  {
    id: 'craft-cooked-meat',
    name: 'Cooked Meat',
    description: 'Roast hunted meat at the campfire.',
    inventoryCosts: { raw_meat: 1, salt: 1 },
    outputItemId: 'cooked_meat',
    outputQuantity: 1,
  },
  {
    id: 'craft-travel-rations',
    name: 'Travel Rations',
    description: 'Preserved food for long roads and cave runs.',
    inventoryCosts: { dates: 1, cooked_meat: 1, salt: 1 },
    outputItemId: 'travel_rations',
    outputQuantity: 1,
  },
  {
    id: 'craft-leather-gloves',
    name: 'Leather Gloves',
    description: 'Basic gloves for gathering and hunting.',
    inventoryCosts: { hide: 2, thread: 1 },
    outputItemId: 'leather_gloves',
    outputQuantity: 1,
  },
  {
    id: 'craft-bait',
    name: 'Bait x3',
    description: 'Simple bait for better fishing attempts.',
    inventoryCosts: { raw_meat: 1, small_oasis_fish: 1 },
    outputItemId: 'bait',
    outputQuantity: 3,
  },
  {
    id: 'craft-torch',
    name: 'Torch',
    description: 'A simple cave torch from wood and cloth fibers.',
    inventoryCosts: { dry_wood: 1, rope: 1 },
    outputItemId: 'torch',
    outputQuantity: 1,
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
