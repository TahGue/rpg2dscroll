export interface WorldEventChoice {
  id: string;
  label: string;
  description: string;
  gold?: number;
  wood?: number;
  iron?: number;
  blueprintId?: string;
  loreId?: string;
}

export interface WorldEventDefinition {
  id: string;
  title: string;
  intro: string;
  choices: WorldEventChoice[];
}

export const WORLD_EVENTS: Record<string, WorldEventDefinition> = {
  broken_caravan: {
    id: 'broken_caravan',
    title: 'Broken Caravan',
    intro:
      'Merchants fled a bandit raid. Their cart lies overturned — traps, gold, and tracks scatter across the sand.',
    choices: [
      {
        id: 'salvage',
        label: 'Salvage the traps',
        description: 'Recover spike trap parts from the wreckage.',
        gold: 15,
        wood: 2,
        blueprintId: 'spike_trap',
      },
      {
        id: 'scouts',
        label: 'Chase the scouts',
        description: 'Run down the raiders for coin and intel.',
        gold: 40,
        loreId: 'lore-bandit-tracks',
      },
      {
        id: 'merchants',
        label: 'Help the merchants',
        description: 'Share water and gather what they left behind.',
        gold: 25,
        wood: 4,
        iron: 1,
      },
    ],
  },
};

export function getWorldEvent(eventId: string): WorldEventDefinition | undefined {
  return WORLD_EVENTS[eventId];
}
