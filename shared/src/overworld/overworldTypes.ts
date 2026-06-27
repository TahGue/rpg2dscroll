export type OverworldPOIKind =
  | 'camp_hub'
  | 'mission'
  | 'npc'
  | 'chest'
  | 'resource'
  | 'gather'
  | 'fishing'
  | 'hunt'
  | 'combat'
  | 'boss'
  | 'cart'
  | 'locked_gate'
  | 'ambush'
  | 'event';

export interface OverworldPOI {
  id: string;
  kind: OverworldPOIKind;
  x: number;
  y: number;
  radius: number;
  label: string;
  /** Mission to offer when interacting */
  missionId?: string;
  /** Resource node id for collectResource */
  resourceLocationId?: string;
  npcId?: string;
  /** Must complete this mission before POI is usable */
  unlockAfterMission?: string;
  /** Hide until player completes this mission */
  revealAfterMission?: string;
  chestGold?: number;
  chestIron?: number;
  /** Show in fast-travel menu after visited. */
  fastTravel?: boolean;
  /** One-shot world event id. */
  eventId?: string;
  eventLoreId?: string;
  questId?: string;
  objectiveId?: string;
  itemRewards?: Record<string, number>;
  goldReward?: number;
  enemyType?: 'hyena' | 'scorpion' | 'bandit' | 'bandit_archer' | 'rashid';
  enemyHp?: number;
  requiredItemId?: string;
}

export interface OverworldWall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OverworldPatrol {
  id: string;
  label: string;
  texture: string;
  /** Closed loop of world coordinates. */
  path: { x: number; y: number }[];
  speed: number;
  touchRadius: number;
  missionId: string;
  /** Optional override for ambush prompt body. */
  ambushBrief?: string;
  revealAfterMission?: string;
  disableAfterMission?: string;
}

export interface OverworldRegionTransition {
  id: string;
  /** Zone top-left in world pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  targetRegionId: string;
  targetX: number;
  targetY: number;
  unlockAfterMission?: string;
}

export interface OverworldRegionTheme {
  baseColor: number;
  accentColor: number;
  title: string;
}

export interface OverworldRegion {
  id: string;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  defaultSpawn: { x: number; y: number };
  theme: OverworldRegionTheme;
  pois: OverworldPOI[];
  walls: OverworldWall[];
  patrols?: OverworldPatrol[];
  transitions?: OverworldRegionTransition[];
}

export type { OverworldPosition } from '../types/save';
