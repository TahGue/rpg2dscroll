export type LoreCategory = 'history' | 'legend' | 'enemy' | 'region';

export interface LoreEntry {
  id: string;
  title: string;
  category: LoreCategory;
  body: string;
}

export const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'lore-nahran',
    title: 'City of Nahran',
    category: 'region',
    body: 'Nahran rises from the golden dunes like a lantern in the desert night. Its gates have stood for generations, guarded by warriors who know that the sand hides as many teeth as treasures.',
  },
  {
    id: 'lore-night-raid',
    title: 'The First Attack',
    category: 'history',
    body: 'When hyenas first came under the moon, elders said it was a bad omen. Then the bandits followed. Malik was posted at the outer gate — the first line between Nahran and the hungry dark.',
  },
  {
    id: 'lore-oasis-well',
    title: 'Waters of Life',
    category: 'legend',
    body: 'The Silent Oasis is said to have been blessed by a wandering sage. Its well never runs dry, and raiders know that to poison or break it is to declare war on every tribe within a hundred dunes.',
  },
  {
    id: 'lore-red-dunes',
    title: 'Red Dune Pass',
    category: 'region',
    body: 'The pass cuts through crimson dunes where the wind screams like a wounded beast. Archers nest in the ridges here, and caravans pay Malik\'s people in gold just to see another sunset.',
  },
  {
    id: 'lore-first-sentinels',
    title: 'The First Sentinels',
    category: 'history',
    body: 'Long before Nahran was built, desert warriors called the First Sentinels raised watchtowers and shrines across the dunes. They fought shadow and sand alike, leaving relics that still hum with old power.',
  },
  {
    id: 'lore-hyena-tracks',
    title: 'Hyena Trails',
    category: 'enemy',
    body: 'Three-toed prints in the night sand mean a pack is circling. Hyenas hunt in silence until they strike — the elders say when the tracks point toward camp, the gate must be manned before moonset.',
  },
  {
    id: 'lore-bandit-tracks',
    title: 'Bandit Scouts',
    category: 'enemy',
    body: 'Light footprints and torn cloth mark where scouts fled the caravan raid. They report to a larger bandit camp on the eastern road — the same raiders who test Nahran\'s gates.',
  },
  {
    id: 'lore-scorpion-nest',
    title: 'Scorpion Nest',
    category: 'enemy',
    body: 'Travelers whisper of a nest beneath the broken watchtower — a breeding ground for dune scorpions grown fat on bandit corpses. Their venom burns long after the sting, and their shells turn blades aside.',
  },
  {
    id: 'lore-dune-scorpion',
    title: 'Dune Scorpion',
    category: 'enemy',
    body: 'The dune scorpion is no mere beast. It is patient, armored, and cruel. When it rises from the sand, even iron vanguards give it room. Malik must strike fast or be worn down by poison and time.',
  },
  {
    id: 'lore-black-eclipse',
    title: 'The Black Eclipse',
    category: 'legend',
    body: 'A darkness spreads across the desert sky — not storm, not night, but something older. Under the Black Eclipse, iron-clad warriors march without rest, and the Shadow Emir\'s will bends the dunes to war.',
  },
  {
    id: 'lore-shadow-emir',
    title: 'The Shadow Emir',
    category: 'legend',
    body: 'They say the Shadow Emir was once a sentinel who traded his oath for power. Now he commands from beyond the eclipse, sending vanguards and beasts to break every gate Malik swore to protect.',
  },
  {
    id: 'lore-lion-sahar',
    title: 'Sahar the Lion',
    category: 'legend',
    body: 'Malik\'s lion companion Sahar is no trained pet. Bedouin legend holds that a true desert guardian earns the loyalty of the dunes\' wildest heart — and Sahar answers Malik\'s roar with thunder.',
  },
  {
    id: 'lore-hidden-cistern',
    title: 'Hidden Cistern',
    category: 'region',
    body: 'Before Nahran was walled, desert tribes buried clay cisterns along trade routes — emergency water for caravans caught in sandstorms. Malik finds one still sealed, its water cool after centuries.',
  },
  {
    id: 'lore-sand-wraith',
    title: 'Sand Wraiths',
    category: 'enemy',
    body: 'Fast as wind and pale as bone, sand wraiths are raiders who wrap themselves in bleached cloth and strike before defenders can react. They haunt shrine ruins and eclipse battlefields alike.',
  },
  {
    id: 'lore-iron-veins',
    title: 'Iron Veins',
    category: 'region',
    body: 'Red-brown ore streaks the canyon walls south of Nahran. Bedouin smiths forge gate braces and spearheads from desert iron — every ingot Malik hauls home strengthens the camp.',
  },
  {
    id: 'lore-leather-trade',
    title: 'Leather Trade',
    category: 'region',
    body: 'Raiders stash cured hides in buried caches along forgotten routes. Malik repurposes the leather for lion harnesses, merchant tents, and the straps that hold his shield.',
  },
  {
    id: 'lore-oasis-palms',
    title: 'Oasis Palms',
    category: 'region',
    body: 'Date palms mark hidden groves where wood still grows. Timber is scarce in the deep dunes; every branch Malik gathers becomes repair beams for gates and towers.',
  },
];

export const LORE_NODE_ENTRIES: Record<string, string> = {
  'scorpion-nest': 'lore-scorpion-nest',
  'sentinel-shrine': 'lore-first-sentinels',
  'hidden-cistern': 'lore-hidden-cistern',
  'iron-vein': 'lore-iron-veins',
  'leather-cache': 'lore-leather-trade',
  'wood-grove': 'lore-oasis-palms',
};

export function getLoreById(id: string): LoreEntry | undefined {
  return LORE_ENTRIES.find((e) => e.id === id);
}

export function getLoreIdsForMission(missionId: string): string[] {
  return MISSION_LORE_UNLOCKS[missionId] ?? [];
}

const MISSION_LORE_UNLOCKS: Record<string, string[]> = {
  'mission-night-attack': ['lore-nahran', 'lore-night-raid'],
  'mission-silent-oasis': ['lore-oasis-well'],
  'mission-bandit-road': ['lore-red-dunes'],
  'mission-red-dune-pass': ['lore-red-dunes'],
  'mission-caravan-escort': ['lore-red-dunes'],
  'mission-shrine-sanctum': ['lore-first-sentinels', 'lore-sand-wraith'],
  'mission-broken-watchtower': ['lore-dune-scorpion'],
  'mission-scorpion-nest': ['lore-scorpion-nest'],
  'mission-black-eclipse': ['lore-black-eclipse', 'lore-shadow-emir'],
  'mission-shadow-emir': ['lore-shadow-emir'],
};
