import type { BuildChoice } from '../types/save';

export const PREP_MISSION_IDS = [
  'mission-night-attack',
  'mission-silent-oasis',
  'mission-scorpion-nest',
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
};

export interface MissionLoadout {
  heroId: string | null;
  gateGuard: boolean;
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
