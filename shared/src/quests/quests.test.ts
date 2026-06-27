import { describe, expect, it } from 'vitest';
import { CRAFT_RECIPES } from '../crafting/craftRecipes';
import { INVENTORY_ITEMS } from '../inventory/inventoryItems';
import {
  DEMO_QUESTS,
  createQuestProgress,
  getActiveQuestHint,
  getQuest,
  getQuestsForObjective,
  isQuestComplete,
} from './quests';

describe('Drying Well quests', () => {
  it('tracks incomplete and complete quest objectives', () => {
    const quest = getQuest('quest-drying-well');
    expect(quest).toBeDefined();
    const progress = createQuestProgress();
    progress.objectives.inspect_well = 1;
    progress.objectives.healing_herb = 6;
    progress.objectives.water_sample = 1;

    expect(isQuestComplete(quest!, progress)).toBe(true);
  });

  it('reports the next active quest objective', () => {
    const progress = {
      'quest-road-trouble': {
        ...createQuestProgress(),
        objectives: { craft_arrows: 10 },
      },
    };

    expect(getActiveQuestHint(progress)).toContain('Defeat hyenas');
  });

  it('finds quests that should start when an objective is discovered early', () => {
    expect(getQuestsForObjective('defeat_rashid').map((quest) => quest.id)).toEqual(['quest-bandit-camp']);
    expect(getQuestsForObjective('hide').map((quest) => quest.id)).toEqual(['quest-hunters-lesson']);
  });

  it('defines the full demo quest list and Oasis Road completion unlock', () => {
    expect(DEMO_QUESTS.map((quest) => quest.title)).toEqual([
      'The Drying Well',
      'Road Trouble',
      'Bandit Camp',
      'Fisherman\'s First Catch',
      'Herbalist Medicine',
      'Hunter\'s Lesson',
      'Blacksmith\'s Ore',
    ]);
    expect(getQuest('quest-bandit-camp')?.unlocks).toContain('oasis_road');
  });
});

describe('Drying Well adventure inventory and crafting', () => {
  it('defines plan-required demo items', () => {
    const ids = new Set(INVENTORY_ITEMS.map((item) => item.id));
    for (const id of [
      'palm_wood',
      'stone',
      'healing_herb',
      'desert_mint',
      'water_flask',
      'small_oasis_fish',
      'hide',
      'iron_ore',
      'feather',
      'rope',
      'salt',
      'thread',
    ]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it('defines plan-required recipes with inventory stack costs', () => {
    const recipes = new Map(CRAFT_RECIPES.map((recipe) => [recipe.id, recipe]));

    expect(recipes.get('craft-healing-potion')?.inventoryCosts).toEqual({ healing_herb: 2, water_flask: 1 });
    expect(recipes.get('craft-arrows')?.outputQuantity).toBe(10);
    expect(recipes.get('craft-simple-spear')?.outputItemId).toBe('simple_spear');
    expect(recipes.get('craft-grilled-fish')?.inventoryCosts).toEqual({ small_oasis_fish: 1 });
    expect(recipes.get('craft-leather-gloves')?.inventoryCosts).toEqual({ hide: 2, thread: 1 });
    expect(recipes.get('craft-torch')?.outputItemId).toBe('torch');
  });
});
