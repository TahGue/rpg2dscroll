import type { MissionType } from '../types/mission';
import type { WideBattlefieldConfig } from './wideBattlefield';
import {
  NIGHT_ATTACK_WIDE,
  SCORPION_NEST_WIDE,
  SILENT_OASIS_WIDE,
  RED_DUNE_PASS_WIDE,
  BROKEN_WATCHTOWER_WIDE,
  SHRINE_SANCTUM_WIDE,
  BLACK_ECLIPSE_WIDE,
  SHADOW_EMIR_WIDE,
} from './wideBattlefield';

export type { WideBattlefieldConfig } from './wideBattlefield';
export { getBuildSocketRatios, isWideBattlefield } from './wideBattlefield';

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
  /** Center-gate wide battlefield with left/right exploration. */
  wideBattlefield?: WideBattlefieldConfig;
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
    worldWidth: 4000,
    gateXRatio: 0.5,
    socketXRatio: 0.36,
    playerSpawnXRatio: 0.5,
    showCampBackground: true,
    showZoneMarkers: false,
    wideBattlefield: NIGHT_ATTACK_WIDE,
  },
  'mission-silent-oasis': {
    worldWidth: 4200,
    gateXRatio: 0.5,
    socketXRatio: 0.38,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    hazards: [{ type: 'oasis_heal', xStartRatio: 0.46, xEndRatio: 0.58 }],
    wideBattlefield: SILENT_OASIS_WIDE,
  },
  'mission-red-dune-pass': {
    worldWidth: 4200,
    gateXRatio: 0.5,
    socketXRatio: 0.38,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    hazards: [
      { type: 'soft_sand', xStartRatio: 0.08, xEndRatio: 0.28 },
      { type: 'wind_gust', xStartRatio: 0.1, xEndRatio: 0.32, windPush: -160 },
    ],
    wideBattlefield: RED_DUNE_PASS_WIDE,
  },
  'mission-broken-watchtower': {
    worldWidth: 4600,
    gateXRatio: 0.5,
    socketXRatio: 0.36,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    relicPulseOnFinalWave: true,
    wideBattlefield: BROKEN_WATCHTOWER_WIDE,
  },
  'mission-black-eclipse': {
    worldWidth: 4800,
    gateXRatio: 0.5,
    socketXRatio: 0.4,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    hazards: [{ type: 'poison_pool', xStartRatio: 0.14, xEndRatio: 0.26 }],
    eclipseDarkness: true,
    wideBattlefield: BLACK_ECLIPSE_WIDE,
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
    worldWidth: 4400,
    gateXRatio: 0.5,
    socketXRatio: 0.36,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    gateLabel: 'SACRED SHRINE',
    wideBattlefield: SHRINE_SANCTUM_WIDE,
  },
  'mission-bandit-road': {
    worldWidth: 2000,
    spawnX: 160,
    gateXRatio: 0.88,
    playerSpawnXRatio: 0.55,
    prepPhaseMs: 1500,
  },
  'mission-shadow-emir': {
    worldWidth: 5000,
    gateXRatio: 0.5,
    socketXRatio: 0.42,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    eclipseDarkness: true,
    wideBattlefield: SHADOW_EMIR_WIDE,
  },
  'mission-scorpion-nest': {
    worldWidth: 4400,
    gateXRatio: 0.5,
    socketXRatio: 0.4,
    playerSpawnXRatio: 0.5,
    showZoneMarkers: false,
    gateLabel: 'CAMP BARRICADE',
    hazards: [{ type: 'poison_pool', xStartRatio: 0.12, xEndRatio: 0.22 }],
    poisonPoolsBetweenWaves: {
      1: { xStartRatio: 0.72, xEndRatio: 0.82 },
      2: { xStartRatio: 0.08, xEndRatio: 0.16 },
    },
    wideBattlefield: SCORPION_NEST_WIDE,
  },
};

export function getDefenseLayout(missionId: string, _missionType?: MissionType): DefenseLayout {
  const overrides = MISSION_LAYOUTS[missionId] ?? {};
  return { ...DEFAULT_LAYOUT, ...overrides };
}
