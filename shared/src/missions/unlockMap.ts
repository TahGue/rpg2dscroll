/** Maps completed mission id → location ids to unlock */
export const MISSION_UNLOCKS: Record<string, string[]> = {
  'mission-night-attack': ['silent-oasis'],
  'mission-silent-oasis': ['red-dune-pass', 'bandit-road', 'dune-caravan', 'wood-grove'],
  'mission-red-dune-pass': ['broken-watchtower', 'sentinel-shrine', 'shrine-sanctum', 'merchants-crossing'],
  'mission-caravan-escort': ['hidden-cistern'],
  'mission-broken-watchtower': ['black-eclipse-gate', 'scorpion-nest', 'iron-vein'],
  'mission-black-eclipse': ['shadow-emir-fortress'],
  'mission-scorpion-nest': ['sentinel-shrine'],
  'mission-bandit-road': ['merchants-crossing'],
  'mission-shrine-sanctum': ['sentinel-shrine'],
  'mission-shadow-emir': [],
};
