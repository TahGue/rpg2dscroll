export interface InventoryItemDefinition {
  id: string;
  name: string;
  description: string;
  category:
    | 'weapon'
    | 'tool'
    | 'armor'
    | 'food'
    | 'potion'
    | 'material'
    | 'quest'
    | 'relic'
    | 'fish'
    | 'animal';
  rarity?: 'common' | 'uncommon' | 'rare';
  sellValue?: number;
}

export const INVENTORY_ITEMS: InventoryItemDefinition[] = [
  { id: 'dates', name: 'Dates', description: 'Simple desert food that restores stamina.', category: 'food', sellValue: 2 },
  { id: 'healing_potion', name: 'Healing Potion', description: 'Restores Malik health.', category: 'potion', sellValue: 12 },
  { id: 'stamina_drink', name: 'Stamina Drink', description: 'Restores stamina for travel and gathering.', category: 'potion', sellValue: 10 },
  { id: 'palm_wood', name: 'Palm Wood', description: 'Flexible wood from village palms.', category: 'material', sellValue: 1 },
  { id: 'dry_wood', name: 'Dry Wood', description: 'Useful for tools, fires, and arrows.', category: 'material', sellValue: 1 },
  { id: 'stone', name: 'Stone', description: 'Basic crafting and tool material.', category: 'material', sellValue: 1 },
  { id: 'iron_ore', name: 'Iron Ore', description: 'Ore for the blacksmith forge.', category: 'material', sellValue: 4 },
  { id: 'healing_herb', name: 'Healing Herb', description: 'Herb used in simple medicine.', category: 'material', sellValue: 2 },
  { id: 'desert_mint', name: 'Desert Mint', description: 'Cooling herb for potions and tea.', category: 'material', sellValue: 3 },
  { id: 'water_flask', name: 'Water Flask', description: 'Clean water for recipes and quests.', category: 'material', sellValue: 2 },
  { id: 'rope', name: 'Rope', description: 'Used for tools, bows, and camp repairs.', category: 'material', sellValue: 3 },
  { id: 'feather', name: 'Feather', description: 'Fletching material for arrows.', category: 'animal', sellValue: 2 },
  { id: 'hide', name: 'Hide', description: 'Animal hide for leather gear.', category: 'animal', sellValue: 5 },
  { id: 'raw_meat', name: 'Raw Meat', description: 'Can be cooked at camp.', category: 'animal', sellValue: 3 },
  { id: 'small_oasis_fish', name: 'Small Oasis Fish', description: 'A common fish for cooking.', category: 'fish', sellValue: 4 },
  { id: 'grilled_fish', name: 'Grilled Fish', description: 'Cooked food from oasis fish.', category: 'food', sellValue: 8 },
  { id: 'arrows', name: 'Arrows', description: 'Ammunition for the bow.', category: 'weapon', sellValue: 1 },
  { id: 'simple_sword', name: 'Simple Sword', description: 'Malik’s starting blade.', category: 'weapon', sellValue: 15 },
  { id: 'simple_spear', name: 'Simple Spear', description: 'Long reach weapon useful against beasts.', category: 'weapon', sellValue: 22 },
  { id: 'bow', name: 'Hunter Bow', description: 'A simple bow for hunting and combat.', category: 'weapon', sellValue: 25 },
  { id: 'axe', name: 'Stone Axe', description: 'Tool for chopping trees and crates.', category: 'tool', sellValue: 10 },
  { id: 'pickaxe', name: 'Stone Pickaxe', description: 'Tool for mining rocks and ore.', category: 'tool', sellValue: 10 },
  { id: 'fishing_rod', name: 'Fishing Rod', description: 'Tool for catching fish at water spots.', category: 'tool', sellValue: 12 },
  { id: 'hunting_knife', name: 'Hunting Knife', description: 'Tool for gathering animal materials.', category: 'tool', sellValue: 15 },
  { id: 'leather_gloves', name: 'Leather Gloves', description: 'Simple crafted hand protection.', category: 'armor', sellValue: 14 },
  { id: 'torch', name: 'Torch', description: 'Lights caves and dark ruins.', category: 'tool', sellValue: 6 },
  { id: 'recipe_healing_potion', name: 'Healing Potion Recipe', description: 'Teaches the basic potion recipe.', category: 'quest' },
  { id: 'recipe_grilled_fish', name: 'Grilled Fish Recipe', description: 'Teaches campfire fish cooking.', category: 'quest' },
  { id: 'recipe_simple_spear', name: 'Simple Spear Recipe', description: 'Teaches spear crafting.', category: 'quest' },
  { id: 'bait', name: 'Bait', description: 'Improves fishing attempts.', category: 'material', sellValue: 1 },
  { id: 'stolen_water_tools', name: 'Stolen Water Tools', description: 'Quest item recovered from Rashid’s camp.', category: 'quest' },
  { id: 'relic_shard', name: 'Relic Shard', description: 'Fragment of First Sentinel power.', category: 'relic', rarity: 'rare', sellValue: 50 },
];

export function getInventoryItem(id: string): InventoryItemDefinition | undefined {
  return INVENTORY_ITEMS.find((i) => i.id === id);
}
