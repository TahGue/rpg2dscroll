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
  sandstorm_gate: {
    id: 'sandstorm_gate',
    title: 'Sandstorm Gate',
    intro:
      'A wall of sand blocks the southern road. Scouts say the storm will pass — or you can push through before it worsens.',
    choices: [
      {
        id: 'wait',
        label: 'Wait for the wind to die',
        description: 'Shelter with the caravan and gather supplies.',
        gold: 20,
        wood: 3,
      },
      {
        id: 'push',
        label: 'Push through the storm',
        description: 'Brave the gale and salvage iron from buried crates.',
        gold: 10,
        iron: 3,
        loreId: 'lore-bandit-tracks',
      },
      {
        id: 'scout',
        label: 'Send scouts around the dunes',
        description: 'Find a safer path south into the canyon.',
        gold: 15,
        wood: 2,
        iron: 1,
      },
    ],
  },
  eclipse_omen: {
    id: 'eclipse_omen',
    title: 'Eclipse Omen',
    intro:
      'The sun dims over the rim. Old sentinels carved warnings here — the Shadow Emir\'s host gathers beyond the gate.',
    choices: [
      {
        id: 'read_stones',
        label: 'Read the sentinel stones',
        description: 'Decipher the First Sentinels\' warnings.',
        gold: 15,
        loreId: 'lore-black-eclipse',
      },
      {
        id: 'gather_iron',
        label: 'Salvage buried iron',
        description: 'Pry ore from collapsed watch posts.',
        gold: 10,
        iron: 4,
      },
      {
        id: 'bless_gate',
        label: 'Bless the outpost gate',
        description: 'Rites that strengthen the final defense.',
        gold: 20,
        wood: 3,
        loreId: 'lore-first-sentinels',
      },
    ],
  },
};

export function getWorldEvent(eventId: string): WorldEventDefinition | undefined {
  return WORLD_EVENTS[eventId];
}
