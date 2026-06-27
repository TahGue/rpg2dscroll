import type { LocalSaveData } from '../types/save';
import type { OverworldPOI, OverworldPatrol, OverworldRegion, OverworldRegionTransition } from './overworldTypes';
import { getOverworldRegion } from './nahranOutskirts';
import { getCurrentMapNodeId, getLocationDisplayName } from '../world/worldMap';

export const OVERWORLD_CELL_SIZE = 100;
export const OVERWORLD_EXPLORE_RADIUS = 130;

export function getOverworldCellKey(regionId: string, x: number, y: number, cellSize = OVERWORLD_CELL_SIZE): string {
  const cx = Math.floor(x / cellSize);
  const cy = Math.floor(y / cellSize);
  return `${regionId}:${cx},${cy}`;
}

export function getNewExploredCellsNearPoint(
  regionId: string,
  x: number,
  y: number,
  explored: string[],
  radius = OVERWORLD_EXPLORE_RADIUS,
  cellSize = OVERWORLD_CELL_SIZE,
): string[] {
  const existing = new Set(explored);
  const added: string[] = [];
  const minCx = Math.floor((x - radius) / cellSize);
  const maxCx = Math.floor((x + radius) / cellSize);
  const minCy = Math.floor((y - radius) / cellSize);
  const maxCy = Math.floor((y + radius) / cellSize);

  for (let cx = minCx; cx <= maxCx; cx += 1) {
    for (let cy = minCy; cy <= maxCy; cy += 1) {
      const centerX = cx * cellSize + cellSize / 2;
      const centerY = cy * cellSize + cellSize / 2;
      if ((centerX - x) ** 2 + (centerY - y) ** 2 > radius ** 2) continue;
      const key = `${regionId}:${cx},${cy}`;
      if (!existing.has(key)) {
        existing.add(key);
        added.push(key);
      }
    }
  }

  return added;
}

export function getInitialExploredCells(region: OverworldRegion): string[] {
  const cells = getNewExploredCellsNearPoint(
    region.id,
    region.defaultSpawn.x,
    region.defaultSpawn.y,
    [],
    180,
  );
  for (const poi of region.pois) {
    if (!poi.revealAfterMission) {
      cells.push(...getNewExploredCellsNearPoint(region.id, poi.x, poi.y, cells, poi.radius + 40));
    }
  }
  return [...new Set(cells)];
}

export function isOverworldCellExplored(
  regionId: string,
  x: number,
  y: number,
  explored: string[],
  cellSize = OVERWORLD_CELL_SIZE,
): boolean {
  return explored.includes(getOverworldCellKey(regionId, x, y, cellSize));
}

export interface OverworldCampaignProgress {
  completedSteps: number;
  totalSteps: number;
  percent: number;
  chapterTitle: string;
  chapterSubtitle: string;
}

type OverworldCampaignSave = Pick<
  LocalSaveData,
  'completedMissions' | 'recruitedHeroes' | 'visitedOverworldRegions' | 'campaignComplete'
>;

const CAMPAIGN_STEP_CHECKS: Array<(save: OverworldCampaignSave) => boolean> = [
  (save) => save.recruitedHeroes.includes('aisha'),
  (save) => save.completedMissions.includes('mission-night-attack'),
  (save) => save.completedMissions.includes('mission-silent-oasis'),
  (save) => save.visitedOverworldRegions.includes('scorpion-valley'),
  (save) => save.completedMissions.includes('mission-scorpion-nest'),
  (save) => save.completedMissions.includes('mission-broken-watchtower'),
  (save) => save.completedMissions.includes('mission-shrine-sanctum'),
  (save) => save.visitedOverworldRegions.includes('black-eclipse-rim'),
  (save) => save.completedMissions.includes('mission-black-eclipse'),
  (save) => save.completedMissions.includes('mission-shadow-emir') || save.campaignComplete,
];

function getCampaignChapterForStep(stepIndex: number): { title: string; subtitle: string } {
  if (stepIndex <= 1) return { title: 'Act I', subtitle: 'Nahran Under Siege' };
  if (stepIndex <= 3) return { title: 'Act II', subtitle: 'Oases and Ambushes' };
  if (stepIndex <= 6) return { title: 'Act III', subtitle: 'First Sentinels' };
  if (stepIndex <= 8) return { title: 'Act IV', subtitle: 'Shadow Over the Dunes' };
  return { title: 'Act V', subtitle: 'Guardian of the Dunes' };
}

export function getOverworldCampaignProgress(save: OverworldCampaignSave): OverworldCampaignProgress {
  const totalSteps = CAMPAIGN_STEP_CHECKS.length;
  const completedSteps = CAMPAIGN_STEP_CHECKS.filter((check) => check(save)).length;
  const percent = Math.round((completedSteps / totalSteps) * 100);
  const firstIncomplete = CAMPAIGN_STEP_CHECKS.findIndex((check) => !check(save));
  const focusStep = firstIncomplete === -1 ? totalSteps - 1 : firstIncomplete;
  const chapter = getCampaignChapterForStep(focusStep);

  return {
    completedSteps,
    totalSteps,
    percent: save.campaignComplete ? 100 : percent,
    chapterTitle: save.campaignComplete ? 'Complete' : chapter.title,
    chapterSubtitle: save.campaignComplete ? 'Guardian of the Dunes' : chapter.subtitle,
  };
}

type CampaignGoalSave = Pick<
  LocalSaveData,
  | 'completedMissions'
  | 'recruitedHeroes'
  | 'unlockedBlueprints'
  | 'visitedOverworldRegions'
  | 'campaignComplete'
  | 'unlockedMissions'
>;

/** Short next-step text after a mission victory. */
export function getCampaignNextGoal(
  save: CampaignGoalSave,
  returnScreen: 'world_explore' | 'world_map' | string,
): string | null {
  if (save.campaignComplete) return null;
  if (returnScreen === 'world_explore') return getOverworldQuestHint(save);
  const nodeId = getCurrentMapNodeId(save);
  return `Next stop: ${getLocationDisplayName(nodeId)} on the campaign map`;
}

export function getOverworldQuestHint(
  save: Pick<
    LocalSaveData,
    'completedMissions' | 'recruitedHeroes' | 'unlockedBlueprints' | 'visitedOverworldRegions' | 'campaignComplete'
  >,
): string {
  const done = save.completedMissions;
  if (save.campaignComplete) {
    return 'The desert is saved — begin New Game+ from camp or the main menu';
  }
  if (!save.recruitedHeroes.includes('aisha')) {
    return 'Visit the Camp Blacksmith — Aisha may join your defense';
  }
  if (!save.unlockedBlueprints.includes('spike_trap')) {
    return 'Search the broken caravan wreck for trap blueprints';
  }
  if (!done.includes('mission-night-attack')) {
    return 'Walk to Nahran Gate and defend the camp before sunrise';
  }
  if (!save.recruitedHeroes.includes('yusuf')) {
    return 'Silent Oasis is open — recruit Yusuf at the Water Keeper';
  }
  if (!done.includes('mission-silent-oasis')) {
    return 'Follow the north road to Silent Oasis and protect the well';
  }
  if (!done.includes('mission-bandit-road')) {
    return 'Optional: clear Bandit Road east of the oasis for gold and leather';
  }
  if (!done.includes('mission-caravan-escort')) {
    return 'Optional: escort the trade caravan before marching south';
  }
  if (!save.visitedOverworldRegions.includes('scorpion-valley')) {
    return 'March south through Red Dune Pass into Scorpion Valley';
  }
  if (!save.recruitedHeroes.includes('hamza')) {
    return 'Recruit Hamza the Fire Trapper at Valley Camp';
  }
  if (!done.includes('mission-scorpion-nest')) {
    return 'Descend to the Scorpion Nest and hold the barricade';
  }
  if (!done.includes('mission-broken-watchtower')) {
    return 'Follow Sentinel Road east to the Broken Watchtower';
  }
  if (!save.recruitedHeroes.includes('salim')) {
    return 'Recruit Salim the Sentinel Keeper at the shrine';
  }
  if (!done.includes('mission-shrine-sanctum')) {
    return 'Enter the Shrine of the First Sentinels and claim a relic';
  }
  if (!save.visitedOverworldRegions.includes('black-eclipse-rim')) {
    return 'Cross east into the Black Eclipse Rim beyond the shrine';
  }
  if (!done.includes('mission-black-eclipse')) {
    return 'Hold the Black Eclipse Gate against the iron vanguard';
  }
  if (!done.includes('mission-shadow-emir')) {
    return 'Assault the Shadow Emir Fortress — the campaign finale';
  }
  if (!done.includes('mission-red-dune-pass')) {
    return 'Optional: hold Red Dune Pass on the Nahran road';
  }
  if (!done.includes('mission-bandit-road')) {
    return 'Optional: clear Bandit Road ambushes for gold and leather';
  }
  return 'Explore the desert — optional roads and caches remain';
}

export interface OverworldFastTravelDestination {
  regionId: string;
  regionName: string;
  poi: OverworldPOI;
}

export function getAllFastTravelDestinations(
  save: Pick<LocalSaveData, 'completedMissions' | 'visitedOverworldPOIs' | 'visitedOverworldRegions'>,
): OverworldFastTravelDestination[] {
  const destinations: OverworldFastTravelDestination[] = [];
  for (const regionId of save.visitedOverworldRegions) {
    const region = getOverworldRegion(regionId);
    for (const poi of getFastTravelDestinations(region, save)) {
      destinations.push({ regionId, regionName: region.name, poi });
    }
  }
  return destinations;
}

export function isRegionTransitionUnlocked(
  transition: OverworldRegionTransition,
  save: Pick<LocalSaveData, 'completedMissions'>,
): boolean {
  if (!transition.unlockAfterMission) return true;
  return save.completedMissions.includes(transition.unlockAfterMission);
}

export function getActiveRegionTransitions(
  region: OverworldRegion,
  save: Pick<LocalSaveData, 'completedMissions'>,
): OverworldRegionTransition[] {
  return (region.transitions ?? []).filter((t) => isRegionTransitionUnlocked(t, save));
}

export function getRegionTransitionAtPoint(
  region: OverworldRegion,
  x: number,
  y: number,
  save: Pick<LocalSaveData, 'completedMissions'>,
): OverworldRegionTransition | null {
  for (const transition of getActiveRegionTransitions(region, save)) {
    if (x >= transition.x && x <= transition.x + transition.w && y >= transition.y && y <= transition.y + transition.h) {
      return transition;
    }
  }
  return null;
}

export function getRegionTransitionHint(
  transition: OverworldRegionTransition,
  save: Pick<LocalSaveData, 'completedMissions'>,
): string {
  if (!isRegionTransitionUnlocked(transition, save)) {
    if (transition.unlockAfterMission === 'mission-silent-oasis') {
      return 'Locked — save the Silent Oasis first';
    }
    if (transition.unlockAfterMission === 'mission-shrine-sanctum') {
      return 'Locked — claim a relic at the Sentinel Shrine first';
    }
    return 'Path blocked — complete earlier defenses first';
  }
  return transition.label;
}

export function isOverworldPatrolActive(
  patrol: OverworldPatrol,
  save: Pick<LocalSaveData, 'completedMissions' | 'defeatedOverworldPatrols'>,
): boolean {
  if (save.defeatedOverworldPatrols.includes(patrol.id)) return false;
  if (patrol.disableAfterMission && save.completedMissions.includes(patrol.disableAfterMission)) return false;
  if (patrol.revealAfterMission && !save.completedMissions.includes(patrol.revealAfterMission)) return false;
  return true;
}

export function getActiveOverworldPatrols(
  region: OverworldRegion,
  save: Pick<LocalSaveData, 'completedMissions' | 'defeatedOverworldPatrols'>,
): OverworldPatrol[] {
  return (region.patrols ?? []).filter((p) => isOverworldPatrolActive(p, save));
}

export function isOverworldPOIVisible(poi: OverworldPOI, save: Pick<LocalSaveData, 'completedMissions'>): boolean {
  if (!poi.revealAfterMission) return true;
  return save.completedMissions.includes(poi.revealAfterMission);
}

export function isOverworldPOIUnlocked(poi: OverworldPOI, save: Pick<LocalSaveData, 'completedMissions'>): boolean {
  if (!isOverworldPOIVisible(poi, save)) return false;
  if (poi.kind === 'locked_gate' && poi.unlockAfterMission) {
    return save.completedMissions.includes(poi.unlockAfterMission);
  }
  if (poi.missionId && poi.kind === 'mission') {
    return true;
  }
  return true;
}

export function getOverworldPOIInteractHint(
  poi: OverworldPOI,
  save: Pick<LocalSaveData, 'completedMissions' | 'openedOverworldChests' | 'collectedResources' | 'completedOverworldEvents'>,
): string {
  if (!isOverworldPOIVisible(poi, save)) return '';
  if (poi.kind === 'locked_gate' && poi.unlockAfterMission && !save.completedMissions.includes(poi.unlockAfterMission)) {
    if (poi.unlockAfterMission === 'mission-silent-oasis') return 'Locked — save the Silent Oasis first';
    if (poi.unlockAfterMission === 'mission-scorpion-nest') return 'Locked — clear the Scorpion Nest first';
    if (poi.unlockAfterMission === 'mission-black-eclipse') return 'Locked — hold the Black Eclipse Gate first';
    return 'Locked — finish earlier defenses first';
  }
  switch (poi.kind) {
    case 'camp_hub':
      return 'Open camp menu';
    case 'mission':
      return save.completedMissions.includes(poi.missionId ?? '')
        ? `Replay: ${poi.label}`
        : `Start defense: ${poi.label}`;
    case 'npc':
      return `Talk to ${poi.label}`;
    case 'chest':
      return save.openedOverworldChests.includes(poi.id) ? 'Empty cache' : 'Search cache';
    case 'cart':
      return save.openedOverworldChests.includes(poi.id) ? 'Already searched' : 'Search wreckage';
    case 'resource':
      return save.collectedResources.includes(poi.resourceLocationId ?? poi.id)
        ? 'Depleted'
        : 'Gather supplies';
    case 'ambush':
      return `Enter ${poi.label}`;
    case 'locked_gate':
      return `Enter ${poi.label}`;
    case 'event':
      return save.completedOverworldEvents.includes(poi.id)
        ? poi.eventId === 'broken_caravan'
          ? 'Wreck picked clean'
          : poi.eventId === 'sandstorm_gate'
            ? 'Storm tracks faded'
            : poi.eventId === 'eclipse_omen'
              ? 'Omen stones stand silent'
              : 'Tracks faded into the sand'
        : poi.eventId === 'broken_caravan'
          ? 'Investigate wreckage'
          : poi.eventId === 'sandstorm_gate'
            ? 'Face the sandstorm'
            : poi.eventId === 'eclipse_omen'
              ? 'Study the eclipse omen'
              : poi.eventId === 'poison_pools'
              ? 'Study the poison pools'
              : 'Investigate tracks';
    default:
      return poi.label;
  }
}

export function getFastTravelDestinations(
  region: OverworldRegion,
  save: Pick<LocalSaveData, 'completedMissions' | 'visitedOverworldPOIs'>,
): OverworldPOI[] {
  return getActiveOverworldPOIs(region, save).filter((poi) => {
    if (!poi.fastTravel) return false;
    if (poi.kind === 'camp_hub') return true;
    return save.visitedOverworldPOIs.includes(poi.id);
  });
}

export function canFastTravelTo(
  poi: OverworldPOI,
  save: Pick<LocalSaveData, 'visitedOverworldPOIs'>,
): boolean {
  if (!poi.fastTravel) return false;
  if (poi.kind === 'camp_hub') return true;
  return save.visitedOverworldPOIs.includes(poi.id);
}

export function getActiveOverworldPOIs(
  region: OverworldRegion,
  save: Pick<LocalSaveData, 'completedMissions'>,
): OverworldPOI[] {
  return region.pois.filter((p) => isOverworldPOIVisible(p, save));
}

/** Walls that block movement — excludes Red Dune gate when unlocked. */
export function getActiveOverworldWalls(
  region: OverworldRegion,
  save: Pick<LocalSaveData, 'completedMissions'>,
): OverworldRegion['walls'] {
  const redDuneOpen = save.completedMissions.includes('mission-silent-oasis');
  if (redDuneOpen) {
    return region.walls.filter((w) => w.y < 1480);
  }
  return region.walls;
}
