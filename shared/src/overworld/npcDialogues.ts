import type { LocalSaveData } from '../types/save';

export interface OverworldNpcDialogue {
  id: string;
  name: string;
  lines: string[];
}

type NpcDialogueSave = Pick<
  LocalSaveData,
  'completedMissions' | 'recruitedHeroes' | 'visitedOverworldRegions' | 'campaignComplete'
>;

interface NpcDialogueStage {
  when: (save: NpcDialogueSave) => boolean;
  lines: string[];
}

interface NpcDialogueDef {
  id: string;
  name: string;
  stages: NpcDialogueStage[];
}

const OVERWORLD_NPC_DEFS: Record<string, NpcDialogueDef> = {
  old_scout: {
    id: 'old_scout',
    name: 'Old Scout',
    stages: [
      {
        when: (s) => s.visitedOverworldRegions.includes('scorpion-valley'),
        lines: [
          'The valley stinks of venom — keep your torch hand ready.',
          'Hamza knows every scorpion trail. Clear the nest before marching on Sentinel Road.',
          'Salim waits at the shrine once the watchtower stones are yours.',
        ],
      },
      {
        when: (s) => s.completedMissions.includes('mission-silent-oasis'),
        lines: [
          'The oasis runs clear — caravans breathe again.',
          'March south into Scorpion Valley. Hamza traps at Valley Camp.',
          'The Broken Watchtower stands east in the canyon — not on the Nahran road.',
        ],
      },
      {
        when: (s) => s.completedMissions.includes('mission-night-attack'),
        lines: [
          'Nahran held through the night. The northern road to Silent Oasis is open.',
          'Recruit Yusuf at the Water Keeper before the bandits return.',
          'Optional patrols still prowl east of the oasis if you want gold and leather.',
        ],
      },
      {
        when: () => true,
        lines: [
          'The dunes are too quiet tonight, Malik.',
          'When the hyenas stop howling, men should prepare their gates.',
          'Walk east to the Nahran Gate — the guard will need you before sunrise.',
        ],
      },
    ],
  },
  blacksmith: {
    id: 'blacksmith',
    name: 'Camp Blacksmith',
    stages: [
      {
        when: (s) => s.recruitedHeroes.includes('aisha') && s.completedMissions.includes('mission-night-attack'),
        lines: [
          'Aisha\'s arrows sang true at the gate. Keep gathering iron for stronger towers.',
          'Spike traps from the caravan wreck will slow the next wave — use them wisely.',
          'The oasis road needs you before the wells run dry.',
        ],
      },
      {
        when: (s) => s.recruitedHeroes.includes('aisha'),
        lines: [
          'Aisha stands ready. Take her to the Nahran Gate before the hyenas break through.',
          'Your blade still has an edge, but the desert dulls steel fast.',
          'Iron from the caves will buy stronger towers later.',
        ],
      },
      {
        when: () => true,
        lines: [
          'Aisha trains archers at the edge of camp. Recruit her before the night attack.',
          'Your blade still has an edge, but the desert dulls steel fast.',
          'Iron from the caves will buy stronger towers later.',
        ],
      },
    ],
  },
  water_keeper: {
    id: 'water_keeper',
    name: 'Water Keeper',
    stages: [
      {
        when: (s) => s.completedMissions.includes('mission-silent-oasis'),
        lines: [
          'The well sings again. March south when you are ready — Scorpion Valley waits.',
          'Yusuf\'s springs will mend any gate you hold in the canyon.',
          'Optional: clear Bandit Road and escort the caravan for leather and water caches.',
        ],
      },
      {
        when: (s) => s.recruitedHeroes.includes('yusuf'),
        lines: [
          'Yusuf walks with you now. Take him to Silent Oasis and hold the well.',
          'Bandits poisoned the outer wells. If this oasis falls, the road dies.',
          'Stand with us — defend the well and caravans will remember Nahran.',
        ],
      },
      {
        when: (s) => s.completedMissions.includes('mission-night-attack'),
        lines: [
          'Nahran survived the raid. Yusuf will join any who defend our waters.',
          'The Silent Oasis lies north — bandits circle it even now.',
          'Recruit Yusuf here, then march to the well before the poison spreads.',
        ],
      },
      {
        when: () => true,
        lines: [
          'Finish Nahran\'s defense first — then we speak of wells and oases.',
          'The night attack must break before I open the northern road.',
        ],
      },
    ],
  },
  hamza_trapper: {
    id: 'hamza_trapper',
    name: 'Hamza the Fire Trapper',
    stages: [
      {
        when: (s) => s.completedMissions.includes('mission-scorpion-nest'),
        lines: [
          'The nest is quiet — for now. Sentinel Road opens east toward the watchtower.',
          'Salim keeps the shrine rites. Claim a relic before the eclipse rim.',
          'My oil still burns hot if you replay the nest.',
        ],
      },
      {
        when: (s) => s.recruitedHeroes.includes('hamza'),
        lines: [
          'Good — you carry flame. Hold the Scorpion Nest barricade and burn what crawls out.',
          'Poison pools below weaken steel. Spike traps along the rim will help.',
          'Walk with me — my oil line scorches the swarm when they break cover.',
        ],
      },
      {
        when: () => true,
        lines: [
          'These scorpions fear flame more than steel. Recruit me before the nest assault.',
          'I lay traps along the canyon rim while you gather supplies.',
          'The nest below poisons every pool — do not march alone.',
        ],
      },
    ],
  },
  sentinel_keeper: {
    id: 'sentinel_keeper',
    name: 'Salim the Sentinel Keeper',
    stages: [
      {
        when: (s) => s.completedMissions.includes('mission-shrine-sanctum'),
        lines: [
          'The shrine stands. Cross east into the Black Eclipse Rim when you are ready.',
          'My ward still mends any gate you defend — take it to the eclipse horizon.',
          'The Shadow Emir\'s vanguard will test every stone the First Sentinels raised.',
        ],
      },
      {
        when: (s) => s.recruitedHeroes.includes('salim'),
        lines: [
          'Stand with me at the Shrine of the First Sentinels — claim a relic there.',
          'My ward will mend any gate you defend in the battles ahead.',
          'When the eclipse comes, you will need every sentinel blessing you can earn.',
        ],
      },
      {
        when: (s) => s.completedMissions.includes('mission-broken-watchtower'),
        lines: [
          'The watchtower stones held. I keep the old rites — recruit me for the shrine assault.',
          'First Sentinel relics sleep in the sanctum beyond this road.',
          'The eclipse rim waits once the shrine is claimed.',
        ],
      },
      {
        when: () => true,
        lines: [
          'Clear the Broken Watchtower first — then we speak of shrines and wards.',
          'The dune scorpion must fall before the sentinel road is safe.',
        ],
      },
    ],
  },
  eclipse_scout: {
    id: 'eclipse_scout',
    name: 'Sentinel Scout',
    stages: [
      {
        when: (s) => s.completedMissions.includes('mission-black-eclipse'),
        lines: [
          'The gate held against the vanguard. The Shadow Emir Fortress lies ahead.',
          'Iron patrols still drift through the shadow — break through or prepare again.',
          'Nahran\'s fate rests on the final assault.',
        ],
      },
      {
        when: (s) => s.completedMissions.includes('mission-shrine-sanctum'),
        lines: [
          'Your relics from the shrine will matter here — hold the Black Eclipse Gate first.',
          'Iron vanguards march when the sky goes black. Build before you blow the horn.',
          'Beyond the gate lies the Shadow Emir\'s fortress.',
        ],
      },
      {
        when: () => true,
        lines: [
          'The eclipse rim is no place for the unprepared.',
          'Claim the Sentinel Shrine in Scorpion Valley before marching here.',
          'Without relics and wards, the gate will not hold.',
        ],
      },
    ],
  },
};

export function getOverworldNpcDialogue(
  npcId: string,
  save: NpcDialogueSave,
): OverworldNpcDialogue | undefined {
  const def = OVERWORLD_NPC_DEFS[npcId];
  if (!def) return undefined;
  const stage = def.stages.find((entry) => entry.when(save)) ?? def.stages[def.stages.length - 1];
  return { id: def.id, name: def.name, lines: stage.lines };
}

/** @deprecated Use getOverworldNpcDialogue(npcId, save) for progression-aware lines. */
export const OVERWORLD_NPCS: Record<string, OverworldNpcDialogue> = Object.fromEntries(
  Object.values(OVERWORLD_NPC_DEFS).map((def) => [
    def.id,
    { id: def.id, name: def.name, lines: def.stages[def.stages.length - 1]?.lines ?? [] },
  ]),
);
