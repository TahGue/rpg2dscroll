export interface OverworldNpcDialogue {
  id: string;
  name: string;
  lines: string[];
}

export const OVERWORLD_NPCS: Record<string, OverworldNpcDialogue> = {
  old_scout: {
    id: 'old_scout',
    name: 'Old Scout',
    lines: [
      'The dunes are too quiet tonight, Malik.',
      'When the hyenas stop howling, men should prepare their gates.',
      'Walk east to the Nahran Gate — the guard will need you before sunrise.',
    ],
  },
  blacksmith: {
    id: 'blacksmith',
    name: 'Camp Blacksmith',
    lines: [
      'Your blade still has an edge, but the desert dulls steel fast.',
      'Visit the upgrade tent in camp when you have gold.',
      'Iron from the caves will buy stronger towers later.',
    ],
  },
  water_keeper: {
    id: 'water_keeper',
    name: 'Water Keeper',
    lines: [
      'Bandits poisoned the outer wells. If this oasis falls, the road dies.',
      'Stand with us — defend the well and caravans will remember Nahran.',
    ],
  },
};

export function getOverworldNpcDialogue(npcId: string): OverworldNpcDialogue | undefined {
  return OVERWORLD_NPCS[npcId];
}
