import type { BuildChoice } from '../types/save';
import type { BattlePost, DefenderPost } from './battlePosts';

export const PREP_MISSION_IDS = [
  'mission-night-attack',
  'mission-silent-oasis',
  'mission-scorpion-nest',
  'mission-broken-watchtower',
  'mission-shrine-sanctum',
  'mission-black-eclipse',
  'mission-shadow-emir',
  'mission-red-dune-pass',
  'mission-caravan-escort',
] as const;

export type PrepMissionId = (typeof PREP_MISSION_IDS)[number];

export interface MissionPrepConfig {
  startingGold: number;
  startingWood: number;
  startingIron: number;
  maxTowerBuilds: number;
  maxTrapBuilds: number;
}

export const MISSION_PREP_CONFIGS: Record<PrepMissionId, MissionPrepConfig> = {
  'mission-night-attack': {
    startingGold: 100,
    startingWood: 10,
    startingIron: 5,
    maxTowerBuilds: 2,
    maxTrapBuilds: 3,
  },
  'mission-silent-oasis': {
    startingGold: 120,
    startingWood: 8,
    startingIron: 4,
    maxTowerBuilds: 2,
    maxTrapBuilds: 3,
  },
  'mission-scorpion-nest': {
    startingGold: 140,
    startingWood: 6,
    startingIron: 8,
    maxTowerBuilds: 2,
    maxTrapBuilds: 4,
  },
  'mission-broken-watchtower': {
    startingGold: 180,
    startingWood: 10,
    startingIron: 12,
    maxTowerBuilds: 3,
    maxTrapBuilds: 3,
  },
  'mission-shrine-sanctum': {
    startingGold: 200,
    startingWood: 8,
    startingIron: 6,
    maxTowerBuilds: 2,
    maxTrapBuilds: 4,
  },
  'mission-black-eclipse': {
    startingGold: 250,
    startingWood: 12,
    startingIron: 15,
    maxTowerBuilds: 3,
    maxTrapBuilds: 4,
  },
  'mission-shadow-emir': {
    startingGold: 300,
    startingWood: 14,
    startingIron: 18,
    maxTowerBuilds: 4,
    maxTrapBuilds: 4,
  },
  'mission-red-dune-pass': {
    startingGold: 160,
    startingWood: 12,
    startingIron: 6,
    maxTowerBuilds: 2,
    maxTrapBuilds: 3,
  },
  'mission-caravan-escort': {
    startingGold: 130,
    startingWood: 8,
    startingIron: 4,
    maxTowerBuilds: 2,
    maxTrapBuilds: 2,
  },
};

export interface MissionLoadout {
  heroId: string | null;
  /** Legacy toggle — synced from defenderPost when omitted. */
  gateGuard?: boolean;
  heroPost?: BattlePost;
  defenderPost?: DefenderPost;
}

export function isPrepMission(missionId: string): missionId is PrepMissionId {
  return (PREP_MISSION_IDS as readonly string[]).includes(missionId);
}

export function getMissionPrepConfig(missionId: string): MissionPrepConfig | null {
  if (!isPrepMission(missionId)) return null;
  return MISSION_PREP_CONFIGS[missionId];
}

export function isTowerBuild(id: string): boolean {
  return id === 'arrow_tower' || id === 'iron_tower';
}

export function isTrapBuild(id: string): boolean {
  return id === 'spike_trap';
}

export function canPlaceBuildType(
  buildId: BuildChoice,
  towersBuilt: number,
  trapsBuilt: number,
  config: MissionPrepConfig,
): boolean {
  if (isTowerBuild(buildId)) return towersBuilt < config.maxTowerBuilds;
  if (isTrapBuild(buildId)) return trapsBuilt < config.maxTrapBuilds;
  return true;
}
