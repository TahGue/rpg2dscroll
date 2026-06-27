/** Inventory items granted on first mission victory */
export const MISSION_INVENTORY_REWARDS: Record<string, Record<string, number>> = {
  'mission-night-attack': { dates: 1 },
  'mission-bandit-road': { firestones: 1 },
  'mission-silent-oasis': { dates: 1 },
  'mission-caravan-escort': { ointment: 1 },
  'mission-shrine-sanctum': { firestones: 1, relic_shard: 1 },
  'mission-red-dune-pass': { ointment: 1 },
  'mission-scorpion-nest': { ointment: 2 },
  'mission-broken-watchtower': { relic_shard: 2 },
  'mission-black-eclipse': { firestones: 2, relic_shard: 1 },
  'mission-shadow-emir': { dates: 2, relic_shard: 2 },
};

export function getMissionInventoryReward(missionId: string): Record<string, number> {
  return MISSION_INVENTORY_REWARDS[missionId] ?? {};
}
