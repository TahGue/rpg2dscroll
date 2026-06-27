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
      'Aisha trains archers at the edge of camp. She will stand with you at the gate.',
      'Your blade still has an edge, but the desert dulls steel fast.',
      'Iron from the caves will buy stronger towers later.',
    ],
  },
  water_keeper: {
    id: 'water_keeper',
    name: 'Water Keeper',
    lines: [
      'Yusuf guards our well with old rites. After Nahran held, he will stand with any who defend the oasis.',
      'Bandits poisoned the outer wells. If this oasis falls, the road dies.',
      'Stand with us — defend the well and caravans will remember Nahran.',
    ],
  },
  hamza_trapper: {
    id: 'hamza_trapper',
    name: 'Hamza the Fire Trapper',
    lines: [
      'These scorpions fear flame more than steel. I lay traps along the canyon rim.',
      'The nest below poisons every pool. Hold the barricade and burn what crawls out.',
      'Walk with me — my oil line will scorch a path when the swarm breaks cover.',
    ],
  },
  eclipse_scout: {
    id: 'eclipse_scout',
    name: 'Sentinel Scout',
    lines: [
      'The eclipse rim is no place for the unprepared. Iron vanguards march when the sky goes black.',
      'Your relics from the shrine will matter here — the gate must not fall.',
      'Beyond lies the Shadow Emir\'s fortress. Hold the Black Eclipse Gate first.',
    ],
  },
};

export function getOverworldNpcDialogue(npcId: string): OverworldNpcDialogue | undefined {
  return OVERWORLD_NPCS[npcId];
}
