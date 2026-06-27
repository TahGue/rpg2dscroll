import type { MissionType } from '../types/mission';

export type HazardZoneType = 'soft_sand' | 'poison_pool' | 'oasis_heal' | 'wind_gust';

export interface HazardZoneDef {
  type: HazardZoneType;
  /** Start position as ratio of world width (0 = left edge). */
  xStartRatio: number;
  /** End position as ratio of world width. */
  xEndRatio: number;
  /** Horizontal push applied to Malik in px/s (negative = left). Used by wind_gust. */
  windPush?: number;
}

export interface DefenseLayout {
  worldWidth: number;
  spawnX: number;
  gateXRatio: number;
  socketXRatio: number;
  /** Extra build socket positions (ratios). Primary socket uses socketXRatio. */
  extraSocketXRatios?: number[];
  playerSpawnXRatio: number;
  showCampBackground: boolean;
  showZoneMarkers: boolean;
  hazards: HazardZoneDef[];
  /** Ancient tower releases a damaging pulse when the final wave begins. */
  relicPulseOnFinalWave: boolean;
  /** Custom gate/objective label override. */
  gateLabel?: string;
  /** Spawn extra poison pools after each cleared wave (wave number → zone ratios). */
  poisonPoolsBetweenWaves?: Record<number, { xStartRatio: number; xEndRatio: number }>;
  /** Wave combat dims the screen; standing near the gate reveals relic light. */
  eclipseDarkness?: boolean;
  /** Ms before wave 1 (prep/build phase). */
  prepPhaseMs?: number;
}

const DEFAULT_LAYOUT: DefenseLayout = {
  worldWidth: 2400,
  spawnX: 120,
  gateXRatio: 0.95,
  socketXRatio: 0.42,
  playerSpawnXRatio: 0.55,
  showCampBackground: false,
  showZoneMarkers: false,
  hazards: [],
  relicPulseOnFinalWave: false,
};

const MISSION_LAYOUTS: Record<string, Partial<DefenseLayout>> = {
  'mission-night-attack': {
    worldWidth: 2200,
    gateXRatio: 0.93,
    socketXRatio: 0.5,
    playerSpawnXRatio: 0.72,
    showCampBackground: true,
    showZoneMarkers: true,
  },
  'mission-silent-oasis': {
    worldWidth: 2600,
    gateXRatio: 0.92,
    socketXRatio: 0.48,
    playerSpawnXRatio: 0.68,
    showZoneMarkers: true,
    hazards: [{ type: 'oasis_heal', xStartRatio: 0.78, xEndRatio: 1 }],
  },
  'mission-red-dune-pass': {
    worldWidth: 2800,
    gateXRatio: 0.94,
    socketXRatio: 0.52,
    extraSocketXRatios: [0.38],
    playerSpawnXRatio: 0.62,
    showZoneMarkers: true,
    hazards: [
      { type: 'soft_sand', xStartRatio: 0.18, xEndRatio: 0.58 },
      { type: 'wind_gust', xStartRatio: 0.32, xEndRatio: 0.62, windPush: -160 },
    ],
  },
  'mission-broken-watchtower': {
    worldWidth: 2600,
    gateXRatio: 0.9,
    socketXRatio: 0.45,
    playerSpawnXRatio: 0.65,
    showZoneMarkers: true,
    relicPulseOnFinalWave: true,
  },
  'mission-black-eclipse': {
    worldWidth: 3000,
    gateXRatio: 0.93,
    socketXRatio: 0.44,
    extraSocketXRatios: [0.58],
    playerSpawnXRatio: 0.6,
    showZoneMarkers: true,
    hazards: [{ type: 'poison_pool', xStartRatio: 0.35, xEndRatio: 0.72 }],
    eclipseDarkness: true,
  },
  'mission-caravan-escort': {
    worldWidth: 3200,
    spawnX: 100,
    gateXRatio: 0.94,
    socketXRatio: 0.45,
    playerSpawnXRatio: 0.12,
    showZoneMarkers: true,
    prepPhaseMs: 6000,
  },
  'mission-shrine-sanctum': {
    worldWidth: 2800,
    gateXRatio: 0.5,
    socketXRatio: 0.36,
    extraSocketXRatios: [0.64],
    playerSpawnXRatio: 0.52,
    showZoneMarkers: true,
    gateLabel: 'SACRED SHRINE',
    prepPhaseMs: 7000,
  },
  'mission-bandit-road': {
    worldWidth: 2000,
    spawnX: 160,
    gateXRatio: 0.88,
    playerSpawnXRatio: 0.55,
    prepPhaseMs: 1500,
  },
  'mission-shadow-emir': {
    worldWidth: 3200,
    gateXRatio: 0.92,
    socketXRatio: 0.48,
    extraSocketXRatios: [0.62],
    playerSpawnXRatio: 0.58,
    showZoneMarkers: true,
    eclipseDarkness: true,
    prepPhaseMs: 8000,
  },
  'mission-scorpion-nest': {
    worldWidth: 2700,
    gateXRatio: 0.91,
    socketXRatio: 0.46,
    playerSpawnXRatio: 0.66,
    showZoneMarkers: true,
    gateLabel: 'CAMP BARRICADE',
    hazards: [{ type: 'poison_pool', xStartRatio: 0.55, xEndRatio: 0.68 }],
    poisonPoolsBetweenWaves: {
      1: { xStartRatio: 0.22, xEndRatio: 0.38 },
      2: { xStartRatio: 0.42, xEndRatio: 0.52 },
    },
  },
};

export function getDefenseLayout(missionId: string, _missionType?: MissionType): DefenseLayout {
  const overrides = MISSION_LAYOUTS[missionId] ?? {};
  return { ...DEFAULT_LAYOUT, ...overrides };
}
