/** Wide side-scrolling defense battlefield — gate centered, explore left & right. */

export interface ScoutMarkerDef {
  xRatio: number;
  label: string;
  side: 'left' | 'right';
}

export interface FieldResourceDef {
  id: string;
  xRatio: number;
  label: string;
  wood?: number;
  iron?: number;
  gold?: number;
}

export interface BrokenDefenseDef {
  id: string;
  xRatio: number;
  label: string;
  /** Repaired structure type. */
  buildType: 'arrow_tower' | 'barricade' | 'spike_trap';
  repairWood: number;
  repairIron: number;
}

export interface WideBattlefieldConfig {
  leftSpawnXRatio: number;
  rightSpawnXRatio: number;
  leftSocketRatios: number[];
  rightSocketRatios: number[];
  centerSocketRatios?: number[];
  scoutMarkers: ScoutMarkerDef[];
  fieldResources: FieldResourceDef[];
  brokenDefenses: BrokenDefenseDef[];
  commanderBrief: string;
  leftZoneLabel?: string;
  rightZoneLabel?: string;
}

export const NIGHT_ATTACK_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.05,
  rightSpawnXRatio: 0.95,
  leftSocketRatios: [0.14, 0.26, 0.36],
  centerSocketRatios: [0.44, 0.56],
  rightSocketRatios: [0.64, 0.74, 0.86],
  leftZoneLabel: 'Hyena Dunes',
  rightZoneLabel: 'Bandit Path',
  scoutMarkers: [
    { xRatio: 0.08, label: 'Hyena tracks', side: 'left' },
    { xRatio: 0.18, label: 'Trap road', side: 'left' },
    { xRatio: 0.92, label: 'Bandit banner', side: 'right' },
    { xRatio: 0.8, label: 'Archer perch', side: 'right' },
  ],
  fieldResources: [
    { id: 'na-left-wood', xRatio: 0.2, label: 'Wood pile', wood: 5 },
    { id: 'na-right-iron', xRatio: 0.78, label: 'Iron scraps', iron: 4 },
    { id: 'na-right-chest', xRatio: 0.84, label: 'Hidden cache', gold: 30 },
  ],
  brokenDefenses: [
    {
      id: 'na-left-tower',
      xRatio: 0.3,
      label: 'Broken arrow tower',
      buildType: 'arrow_tower',
      repairWood: 3,
      repairIron: 2,
    },
    {
      id: 'na-left-barricade',
      xRatio: 0.34,
      label: 'Splintered barricade',
      buildType: 'barricade',
      repairWood: 2,
      repairIron: 0,
    },
  ],
  commanderBrief:
    'The enemy is coming from the dunes, but we still have time. Search both sides, repair what you can, and prepare the defenses.',
};

export const SILENT_OASIS_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.06,
  rightSpawnXRatio: 0.94,
  leftSocketRatios: [0.16, 0.28],
  centerSocketRatios: [0.46, 0.54],
  rightSocketRatios: [0.66, 0.78, 0.88],
  leftZoneLabel: 'Rock Ledge',
  rightZoneLabel: 'Scorpion Hollow',
  scoutMarkers: [
    { xRatio: 0.1, label: 'Bandit archers', side: 'left' },
    { xRatio: 0.9, label: 'Scorpion holes', side: 'right' },
  ],
  fieldResources: [
    { id: 'oa-herbs', xRatio: 0.72, label: 'Healing herbs', wood: 3, gold: 15 },
    { id: 'oa-water', xRatio: 0.58, label: 'Water jars', gold: 20 },
  ],
  brokenDefenses: [
    {
      id: 'oa-left-platform',
      xRatio: 0.24,
      label: 'Cracked archer platform',
      buildType: 'arrow_tower',
      repairWood: 4,
      repairIron: 2,
    },
  ],
  commanderBrief:
    'Raiders circle the well from two directions. Fortify the palm path and the scorpion side before you ring the bell.',
};

export const SCORPION_NEST_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.05,
  rightSpawnXRatio: 0.95,
  leftSocketRatios: [0.14, 0.24],
  centerSocketRatios: [0.45, 0.55],
  rightSocketRatios: [0.68, 0.8, 0.9],
  leftZoneLabel: 'Poison Cave',
  rightZoneLabel: 'Mine Path',
  scoutMarkers: [
    { xRatio: 0.08, label: 'Poison pools', side: 'left' },
    { xRatio: 0.88, label: 'Nest burrows', side: 'right' },
  ],
  fieldResources: [
    { id: 'sn-iron', xRatio: 0.76, label: 'Iron ore', iron: 6 },
    { id: 'sn-wood', xRatio: 0.22, label: 'Timber stash', wood: 4 },
  ],
  brokenDefenses: [
    {
      id: 'sn-stone-tower',
      xRatio: 0.32,
      label: 'Cracked stone socket',
      buildType: 'arrow_tower',
      repairWood: 3,
      repairIron: 4,
    },
    {
      id: 'sn-traps',
      xRatio: 0.7,
      label: 'Rusty trap plates',
      buildType: 'spike_trap',
      repairWood: 2,
      repairIron: 1,
    },
  ],
  commanderBrief:
    'Scorpions boil from both flanks. Gather ore, repair the old defenses, and seal the barricade before the swarm hits.',
};

export function getBuildSocketRatios(config: WideBattlefieldConfig | undefined, fallback: {
  socketXRatio: number;
  extraSocketXRatios?: number[];
}): number[] {
  if (!config) {
    return [fallback.socketXRatio, ...(fallback.extraSocketXRatios ?? [])];
  }
  return [
    ...config.leftSocketRatios,
    ...(config.centerSocketRatios ?? []),
    ...config.rightSocketRatios,
  ];
}

export function isWideBattlefield(config: WideBattlefieldConfig | undefined): config is WideBattlefieldConfig {
  return Boolean(config);
}
