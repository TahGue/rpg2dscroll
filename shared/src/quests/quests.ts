export interface QuestObjective {
  id: string;
  label: string;
  target: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewardGold: number;
  rewardItems?: Record<string, number>;
  unlocks?: string[];
}

export interface QuestProgress {
  started: boolean;
  completed: boolean;
  objectives: Record<string, number>;
}

export const DEMO_QUESTS: QuestDefinition[] = [
  {
    id: 'quest-drying-well',
    title: 'The Drying Well',
    description: 'Help the village elder understand why Nahran\'s well is failing.',
    objectives: [
      { id: 'inspect_well', label: 'Inspect the village well', target: 1 },
      { id: 'healing_herb', label: 'Gather healing herbs', target: 5 },
      { id: 'water_sample', label: 'Bring a water sample to the Herbalist', target: 1 },
    ],
    rewardGold: 50,
    rewardItems: { recipe_healing_potion: 1 },
    unlocks: ['potion_crafting'],
  },
  {
    id: 'quest-road-trouble',
    title: 'Road Trouble',
    description: 'The road guard needs arrows and help clearing hyenas.',
    objectives: [
      { id: 'craft_arrows', label: 'Craft arrows', target: 10 },
      { id: 'defeat_hyena', label: 'Defeat hyenas', target: 3 },
      { id: 'reach_broken_cart', label: 'Reach the broken cart', target: 1 },
    ],
    rewardGold: 35,
    rewardItems: { bow: 1 },
    unlocks: ['hunting'],
  },
  {
    id: 'quest-bandit-camp',
    title: 'Bandit Camp',
    description: 'Track the stolen water tools and defeat Bandit Captain Rashid.',
    objectives: [
      { id: 'track_footprints', label: 'Track bandit footprints', target: 1 },
      { id: 'defeat_bandit', label: 'Clear bandits', target: 3 },
      { id: 'defeat_rashid', label: 'Defeat Bandit Captain Rashid', target: 1 },
    ],
    rewardGold: 90,
    rewardItems: { stolen_water_tools: 1 },
    unlocks: ['oasis_road'],
  },
  {
    id: 'quest-fisherman-first-catch',
    title: 'Fisherman\'s First Catch',
    description: 'Learn to fish at the oasis pond.',
    objectives: [{ id: 'small_oasis_fish', label: 'Catch oasis fish', target: 3 }],
    rewardGold: 25,
    rewardItems: { recipe_grilled_fish: 1, bait: 3 },
  },
  {
    id: 'quest-herbalist-medicine',
    title: 'Herbalist Medicine',
    description: 'Gather herbs and brew medicine for the village.',
    objectives: [
      { id: 'healing_herb', label: 'Gather healing herbs', target: 6 },
      { id: 'desert_mint', label: 'Gather desert mint', target: 2 },
      { id: 'craft_healing_potion', label: 'Craft healing potions', target: 2 },
    ],
    rewardGold: 30,
    rewardItems: { stamina_drink: 1 },
  },
  {
    id: 'quest-hunters-lesson',
    title: 'Hunter\'s Lesson',
    description: 'Learn basic hunting by tracking desert hares.',
    objectives: [
      { id: 'hunt_hare', label: 'Hunt desert hares', target: 2 },
      { id: 'hide', label: 'Collect hides', target: 2 },
      { id: 'craft_leather_gloves', label: 'Craft leather gloves', target: 1 },
    ],
    rewardGold: 30,
    rewardItems: { hunting_knife: 1 },
  },
  {
    id: 'quest-blacksmith-ore',
    title: 'Blacksmith\'s Ore',
    description: 'Mine stone and iron ore for the village blacksmith.',
    objectives: [
      { id: 'stone', label: 'Mine stone', target: 5 },
      { id: 'iron_ore', label: 'Mine iron ore', target: 3 },
    ],
    rewardGold: 40,
    rewardItems: { recipe_simple_spear: 1 },
  },
];

export function getQuest(id: string): QuestDefinition | undefined {
  return DEMO_QUESTS.find((q) => q.id === id);
}

export function getQuestsForObjective(objectiveId: string): QuestDefinition[] {
  return DEMO_QUESTS.filter((quest) => quest.objectives.some((objective) => objective.id === objectiveId));
}

export function createQuestProgress(): QuestProgress {
  return { started: true, completed: false, objectives: {} };
}

export function getQuestObjectiveProgress(progress: QuestProgress | undefined, objectiveId: string): number {
  return progress?.objectives[objectiveId] ?? 0;
}

export function isQuestComplete(quest: QuestDefinition, progress: QuestProgress | undefined): boolean {
  if (!progress?.started) return false;
  return quest.objectives.every((objective) => getQuestObjectiveProgress(progress, objective.id) >= objective.target);
}

export function getActiveQuestHint(progress: Record<string, QuestProgress>): string | null {
  for (const quest of DEMO_QUESTS) {
    const state = progress[quest.id];
    if (!state?.started || state.completed) continue;
    const objective = quest.objectives.find((obj) => getQuestObjectiveProgress(state, obj.id) < obj.target);
    if (!objective) return `Return to claim reward: ${quest.title}`;
    return `${quest.title}: ${objective.label} (${getQuestObjectiveProgress(state, objective.id)}/${objective.target})`;
  }
  return 'Talk to the Village Elder in Nahran Village.';
}
