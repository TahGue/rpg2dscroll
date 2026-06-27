export interface StoryAct {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
}

export const STORY_ACTS: StoryAct[] = [
  {
    id: 'act-1',
    number: 1,
    title: 'The First Attack',
    subtitle: 'Act I — Nahran Under Siege',
    description:
      'Hyenas and bandits strike Nahran under the moon. Malik learns to fight, block, and hold the gate while his people sleep.',
  },
  {
    id: 'act-2',
    number: 2,
    title: 'The Desert Road',
    subtitle: 'Act II — Oases and Ambushes',
    description:
      'Malik travels the desert road between camps and oases. Bandits spread through the dunes, and every well becomes a battlefield.',
  },
  {
    id: 'act-3',
    number: 3,
    title: 'The Ancient Ruins',
    subtitle: 'Act III — First Sentinels',
    description:
      'Broken watchtowers and sacred shrines reveal the history of the First Sentinels. Beasts and raiders stir something old beneath the sand.',
  },
  {
    id: 'act-4',
    number: 4,
    title: 'The Black Eclipse',
    subtitle: 'Act IV — Shadow Over the Dunes',
    description:
      'The sky darkens with the Black Eclipse. Iron vanguards march under a sunless horizon as the Shadow Emir tests every gate Malik has sworn to protect.',
  },
  {
    id: 'act-5',
    number: 5,
    title: 'Guardian of the Dunes',
    subtitle: 'Act V — The Road Continues',
    description:
      'The eclipse passes. Nahran survives, and Malik\'s name travels with every caravan that crosses the sand. The desert still holds secrets — but the gates hold firm.',
  },
];

/** Mission id → act id shown before first play */
export const MISSION_ACT: Record<string, string> = {
  'mission-night-attack': 'act-1',
  'mission-silent-oasis': 'act-2',
  'mission-bandit-road': 'act-2',
  'mission-caravan-escort': 'act-2',
  'mission-shrine-sanctum': 'act-3',
  'mission-red-dune-pass': 'act-2',
  'mission-broken-watchtower': 'act-3',
  'mission-scorpion-nest': 'act-3',
  'mission-black-eclipse': 'act-4',
  'mission-shadow-emir': 'act-5',
};

/** Completing this mission queues the next act banner on the world map */
export const ACT_BANNER_AFTER_MISSION: Record<string, string> = {
  'mission-night-attack': 'act-2',
  'mission-red-dune-pass': 'act-3',
  'mission-broken-watchtower': 'act-4',
  'mission-black-eclipse': 'act-5',
};

export function getActById(id: string): StoryAct | undefined {
  return STORY_ACTS.find((a) => a.id === id);
}

export function getActForMission(missionId: string): StoryAct | undefined {
  const actId = MISSION_ACT[missionId];
  return actId ? getActById(actId) : undefined;
}

export function getActBannerAfterVictory(missionId: string, seenActs: string[]): string | null {
  const actId = ACT_BANNER_AFTER_MISSION[missionId];
  if (!actId || seenActs.includes(actId)) return null;
  return actId;
}

export function getUnseenActForMission(missionId: string, seenActs: string[]): string | null {
  const actId = MISSION_ACT[missionId];
  if (!actId || seenActs.includes(actId)) return null;
  return actId;
}
