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

export const RED_DUNE_PASS_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.06,
  rightSpawnXRatio: 0.94,
  leftSocketRatios: [0.15, 0.28],
  centerSocketRatios: [0.44, 0.56],
  rightSocketRatios: [0.68, 0.8],
  leftZoneLabel: 'Archer Ridge',
  rightZoneLabel: 'Dune Road',
  scoutMarkers: [
    { xRatio: 0.1, label: 'Archer nests', side: 'left' },
    { xRatio: 0.9, label: 'Raider dust', side: 'right' },
  ],
  fieldResources: [
    { id: 'rdp-wood', xRatio: 0.22, label: 'Timber cache', wood: 4 },
    { id: 'rdp-iron', xRatio: 0.76, label: 'Iron crate', iron: 5 },
  ],
  brokenDefenses: [
    {
      id: 'rdp-barricade',
      xRatio: 0.32,
      label: 'Cracked pass wall',
      buildType: 'barricade',
      repairWood: 3,
      repairIron: 1,
    },
  ],
  commanderBrief:
    'Archers fire from the ridge while raiders charge the dune road. Fortify both approaches before the horn sounds.',
};

export const BROKEN_WATCHTOWER_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.05,
  rightSpawnXRatio: 0.95,
  leftSocketRatios: [0.14, 0.26, 0.34],
  centerSocketRatios: [0.46, 0.54],
  rightSocketRatios: [0.66, 0.76, 0.88],
  leftZoneLabel: 'Ruin Road',
  rightZoneLabel: 'Scorpion Pit',
  scoutMarkers: [
    { xRatio: 0.08, label: 'Bandit camp smoke', side: 'left' },
    { xRatio: 0.16, label: 'Sentinel stones', side: 'left' },
    { xRatio: 0.9, label: 'Scorpion burrows', side: 'right' },
  ],
  fieldResources: [
    { id: 'bw-relic', xRatio: 0.2, label: 'Relic shards', gold: 35, iron: 2 },
    { id: 'bw-wood', xRatio: 0.74, label: 'Fallen timbers', wood: 5 },
  ],
  brokenDefenses: [
    {
      id: 'bw-tower',
      xRatio: 0.3,
      label: 'Ruined watchtower',
      buildType: 'arrow_tower',
      repairWood: 4,
      repairIron: 3,
    },
    {
      id: 'bw-traps',
      xRatio: 0.72,
      label: 'Ancient trap gears',
      buildType: 'spike_trap',
      repairWood: 2,
      repairIron: 2,
    },
  ],
  commanderBrief:
    'Bandits stir the dune scorpion from its pit. Search the ruins, repair the old watchtower, and hold both roads.',
};

export const SHRINE_SANCTUM_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.05,
  rightSpawnXRatio: 0.95,
  leftSocketRatios: [0.16, 0.28],
  centerSocketRatios: [0.44, 0.56],
  rightSocketRatios: [0.68, 0.8, 0.88],
  leftZoneLabel: 'West Ruins',
  rightZoneLabel: 'East Approach',
  scoutMarkers: [
    { xRatio: 0.1, label: 'Raider torches', side: 'left' },
    { xRatio: 0.9, label: 'Wraith marks', side: 'right' },
  ],
  fieldResources: [
    { id: 'sh-relic', xRatio: 0.5, label: 'Relic altar', gold: 40 },
    { id: 'sh-wood', xRatio: 0.24, label: 'Sacred timber', wood: 4 },
  ],
  brokenDefenses: [
    {
      id: 'sh-west',
      xRatio: 0.32,
      label: 'Cracked ward stone',
      buildType: 'barricade',
      repairWood: 3,
      repairIron: 2,
    },
  ],
  commanderBrief:
    'Raiders strike the shrine from east and west. Claim relic strength and seal both approaches before the assault.',
};

export const BLACK_ECLIPSE_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.04,
  rightSpawnXRatio: 0.96,
  leftSocketRatios: [0.12, 0.24, 0.34],
  centerSocketRatios: [0.44, 0.56],
  rightSocketRatios: [0.64, 0.76, 0.88],
  leftZoneLabel: 'Shadow Road',
  rightZoneLabel: 'Iron March',
  scoutMarkers: [
    { xRatio: 0.08, label: 'Eclipse omen', side: 'left' },
    { xRatio: 0.92, label: 'Iron vanguard tracks', side: 'right' },
    { xRatio: 0.5, label: 'Relic light', side: 'left' },
  ],
  fieldResources: [
    { id: 'be-iron', xRatio: 0.78, label: 'Iron stockpile', iron: 8 },
    { id: 'be-gold', xRatio: 0.22, label: 'Sentinel cache', gold: 45 },
  ],
  brokenDefenses: [
    {
      id: 'be-tower',
      xRatio: 0.28,
      label: 'Darkened tower base',
      buildType: 'arrow_tower',
      repairWood: 4,
      repairIron: 5,
    },
    {
      id: 'be-barricade',
      xRatio: 0.7,
      label: 'Shattered barricade',
      buildType: 'barricade',
      repairWood: 3,
      repairIron: 3,
    },
  ],
  commanderBrief:
    'The eclipse deepens and iron vanguards march from both horizons. Reinforce every flank before Nahran\'s last gate falls.',
};

export const SHADOW_EMIR_WIDE: WideBattlefieldConfig = {
  leftSpawnXRatio: 0.04,
  rightSpawnXRatio: 0.96,
  leftSocketRatios: [0.12, 0.22, 0.32],
  centerSocketRatios: [0.43, 0.57],
  rightSocketRatios: [0.66, 0.78, 0.9],
  leftZoneLabel: 'Fortress Left',
  rightZoneLabel: 'Emir\'s Host',
  scoutMarkers: [
    { xRatio: 0.08, label: 'Shadow portal', side: 'left' },
    { xRatio: 0.92, label: 'Warlord banners', side: 'right' },
  ],
  fieldResources: [
    { id: 'se-iron', xRatio: 0.24, label: 'War camp iron', iron: 10 },
    { id: 'se-gold', xRatio: 0.8, label: 'Emir tribute', gold: 60 },
  ],
  brokenDefenses: [
    {
      id: 'se-left-tower',
      xRatio: 0.26,
      label: 'Fortress tower ruin',
      buildType: 'arrow_tower',
      repairWood: 5,
      repairIron: 6,
    },
    {
      id: 'se-traps',
      xRatio: 0.74,
      label: 'Light trap array',
      buildType: 'spike_trap',
      repairWood: 3,
      repairIron: 3,
    },
  ],
  commanderBrief:
    'The Shadow Emir watches from the fortress. Every tower, trap, and ally must be in place before the final assault.',
};

export function getLionGuardAnchorRatio(mode: string, wide?: WideBattlefieldConfig): number | null {
  if (mode === 'guard_left' && wide) {
    return wide.leftSocketRatios[Math.floor(wide.leftSocketRatios.length / 2)] ?? 0.2;
  }
  if (mode === 'guard_right' && wide) {
    return wide.rightSocketRatios[Math.floor(wide.rightSocketRatios.length / 2)] ?? 0.8;
  }
  if (mode === 'guard' || mode === 'guard_left' || mode === 'guard_right') return 0.5;
  return null;
}

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
