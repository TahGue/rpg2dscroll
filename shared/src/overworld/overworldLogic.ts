import type { LocalSaveData } from '../types/save';
import type { OverworldPOI, OverworldPatrol, OverworldRegion } from './overworldTypes';

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

export function getOverworldQuestHint(save: Pick<LocalSaveData, 'completedMissions'>): string {
  const done = save.completedMissions;
  if (!done.includes('mission-night-attack')) {
    return 'Walk to Nahran Gate and defend the camp before sunrise';
  }
  if (!done.includes('mission-silent-oasis')) {
    return 'Follow the north road to Silent Oasis and protect the well';
  }
  if (!done.includes('mission-red-dune-pass')) {
    return 'March south through Red Dune Pass and hold the choke point';
  }
  if (!done.includes('mission-broken-watchtower')) {
    return 'Climb to the Broken Watchtower and awaken the ancient relic';
  }
  if (!done.includes('mission-bandit-road')) {
    return 'Optional: clear Bandit Road ambushes for gold and leather';
  }
  return 'Explore the outskirts — new regions await beyond the dunes';
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
    return 'Locked — save the Silent Oasis first';
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
        ? 'Tracks faded into the sand'
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
