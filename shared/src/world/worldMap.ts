import type { LocalSaveData } from '../types/save';
import { getLocationById, getMissionById, LOCATIONS } from '../missions/locations';
import { MISSION_UNLOCKS } from '../missions/unlockMap';

export interface MapRegion {
  id: string;
  name: string;
  subtitle: string;
}

export interface MapPath {
  from: string;
  to: string;
  /** Main campaign spine — drives player marker */
  primary?: boolean;
}

/** Visual positions (0–100) for the parchment map */
export const WORLD_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  'nahran-camp': { x: 14, y: 76 },
  'night-attack': { x: 30, y: 62 },
  'silent-oasis': { x: 46, y: 58 },
  'dune-caravan': { x: 34, y: 72 },
  'wood-grove': { x: 52, y: 48 },
  'merchants-crossing': { x: 20, y: 66 },
  'bandit-road': { x: 58, y: 68 },
  'red-dune-pass': { x: 64, y: 52 },
  'leather-cache': { x: 72, y: 44 },
  'hidden-cistern': { x: 54, y: 40 },
  'iron-vein': { x: 84, y: 50 },
  'broken-watchtower': { x: 48, y: 30 },
  'scorpion-nest': { x: 62, y: 18 },
  'sentinel-shrine': { x: 76, y: 36 },
  'shrine-sanctum': { x: 68, y: 64 },
  'black-eclipse-gate': { x: 52, y: 12 },
  'shadow-emir-fortress': { x: 44, y: 6 },
};

export const MAP_REGIONS: MapRegion[] = [
  {
    id: 'nahran-outskirts',
    name: 'Nahran Outskirts',
    subtitle: 'Warm dunes · camp defense · first raids',
  },
  {
    id: 'scorpion-valley',
    name: 'Scorpion Valley',
    subtitle: 'Rocky passes · poison beasts · trade roads',
  },
  {
    id: 'sentinel-ruins',
    name: 'Sentinel Ruins',
    subtitle: 'Ancient stones · relics · buried secrets',
  },
  {
    id: 'black-eclipse',
    name: 'Black Eclipse Desert',
    subtitle: 'Dark horizon · shadow armies · final stand',
  },
];

export const NODE_REGION: Record<string, string> = {
  'nahran-camp': 'nahran-outskirts',
  'night-attack': 'nahran-outskirts',
  'silent-oasis': 'nahran-outskirts',
  'dune-caravan': 'nahran-outskirts',
  'wood-grove': 'nahran-outskirts',
  'merchants-crossing': 'nahran-outskirts',
  'bandit-road': 'scorpion-valley',
  'red-dune-pass': 'scorpion-valley',
  'leather-cache': 'scorpion-valley',
  'hidden-cistern': 'scorpion-valley',
  'iron-vein': 'scorpion-valley',
  'broken-watchtower': 'sentinel-ruins',
  'scorpion-nest': 'sentinel-ruins',
  'sentinel-shrine': 'sentinel-ruins',
  'shrine-sanctum': 'sentinel-ruins',
  'black-eclipse-gate': 'black-eclipse',
  'shadow-emir-fortress': 'black-eclipse',
};

/** Main campaign route for player marker */
export const PRIMARY_ROUTE = [
  'nahran-camp',
  'night-attack',
  'silent-oasis',
  'red-dune-pass',
  'broken-watchtower',
  'black-eclipse-gate',
  'shadow-emir-fortress',
] as const;

export const MAP_PATHS: MapPath[] = [
  { from: 'nahran-camp', to: 'night-attack', primary: true },
  { from: 'nahran-camp', to: 'merchants-crossing' },
  { from: 'night-attack', to: 'silent-oasis', primary: true },
  { from: 'silent-oasis', to: 'red-dune-pass', primary: true },
  { from: 'silent-oasis', to: 'wood-grove' },
  { from: 'silent-oasis', to: 'dune-caravan' },
  { from: 'silent-oasis', to: 'bandit-road' },
  { from: 'bandit-road', to: 'leather-cache' },
  { from: 'bandit-road', to: 'merchants-crossing' },
  { from: 'red-dune-pass', to: 'broken-watchtower', primary: true },
  { from: 'red-dune-pass', to: 'sentinel-shrine' },
  { from: 'red-dune-pass', to: 'shrine-sanctum' },
  { from: 'dune-caravan', to: 'hidden-cistern' },
  { from: 'broken-watchtower', to: 'black-eclipse-gate', primary: true },
  { from: 'broken-watchtower', to: 'scorpion-nest' },
  { from: 'scorpion-nest', to: 'sentinel-shrine' },
  { from: 'broken-watchtower', to: 'iron-vein' },
  { from: 'black-eclipse-gate', to: 'shadow-emir-fortress', primary: true },
];

export type MapNodeState = 'locked' | 'unlocked' | 'completed' | 'current';

export type MapPathState = 'locked' | 'unlocked' | 'completed';

export const NODE_ICONS: Record<string, string> = {
  camp: '⛺',
  defense: '🏛️',
  resource: '💧',
  ambush: '⚔️',
  lore: '📜',
  boss: '☠️',
  shop: '👜',
};

export function getMapPosition(locationId: string): { x: number; y: number } {
  return (
    WORLD_MAP_POSITIONS[locationId] ??
    LOCATIONS.find((l) => l.id === locationId)?.position ?? { x: 50, y: 50 }
  );
}

export function isLocationUnlocked(
  locationId: string,
  unlockRequirement: string | undefined,
  save: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
): boolean {
  const loc = getLocationById(locationId);
  if (loc?.type === 'camp') return true;
  if (save.unlockedMissions.includes(locationId)) return true;
  if (unlockRequirement && save.completedMissions.includes(unlockRequirement)) return true;
  return !unlockRequirement;
}

export function getMapNodeState(
  locationId: string,
  save: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
  currentNodeId: string,
): MapNodeState {
  const loc = getLocationById(locationId);
  if (!loc) return 'locked';

  const unlocked = isLocationUnlocked(locationId, loc.unlockRequirement, save);
  const completed = loc.missionId ? save.completedMissions.includes(loc.missionId) : false;

  if (loc.type === 'camp') return locationId === currentNodeId ? 'current' : 'unlocked';
  if (!unlocked) return 'locked';
  if (completed) return 'completed';
  if (locationId === currentNodeId) return 'current';
  return 'unlocked';
}

export function getCurrentMapNodeId(
  save: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
): string {
  for (const id of PRIMARY_ROUTE) {
    if (id === 'nahran-camp') continue;
    const loc = getLocationById(id);
    if (!loc?.missionId) continue;
    const unlocked = isLocationUnlocked(id, loc.unlockRequirement, save);
    const completed = save.completedMissions.includes(loc.missionId);
    if (unlocked && !completed) return id;
  }

  const finale = getLocationById('shadow-emir-fortress');
  if (finale?.missionId && save.completedMissions.includes(finale.missionId)) {
    return 'nahran-camp';
  }
  return 'shadow-emir-fortress';
}

export function getMapPathState(
  from: string,
  to: string,
  save: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
): MapPathState {
  const toLoc = getLocationById(to);
  const fromLoc = getLocationById(from);
  if (!toLoc || !fromLoc) return 'locked';

  const toUnlocked = isLocationUnlocked(to, toLoc.unlockRequirement, save);
  const fromCompleted = fromLoc.missionId
    ? save.completedMissions.includes(fromLoc.missionId)
    : fromLoc.type === 'camp';
  const toCompleted = toLoc.missionId ? save.completedMissions.includes(toLoc.missionId) : false;

  if (fromCompleted && toCompleted) return 'completed';
  if (toUnlocked) return 'unlocked';
  return 'locked';
}

export function getUnlockHint(locationId: string): string {
  const loc = getLocationById(locationId);
  if (!loc?.unlockRequirement) return '';
  const req = getMissionById(loc.unlockRequirement);
  return req ? `Complete "${req.name}" to unlock this location.` : 'Complete prior missions to unlock.';
}

export function getRegionForNode(locationId: string): MapRegion | undefined {
  const regionId = NODE_REGION[locationId];
  return MAP_REGIONS.find((r) => r.id === regionId);
}

export function getMissionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    gate_defense: 'Gate Defense',
    survive: 'Survive Until Sunrise',
    oasis: 'Oasis Defense',
    ambush: 'Ambush',
    caravan: 'Caravan Escort',
    shrine: 'Shrine Defense',
    boss: 'Boss Battle',
  };
  return labels[type] ?? type.replace(/_/g, ' ');
}

export function getNodeTypeLabel(nodeType: string): string {
  const labels: Record<string, string> = {
    camp: 'Camp',
    defense: 'Defense Mission',
    resource: 'Resource Site',
    ambush: 'Ambush',
    lore: 'Lore Discovery',
    boss: 'Boss Location',
    shop: 'Merchant',
  };
  return labels[nodeType] ?? nodeType;
}

/** Location ids unlocked by completing a mission (from unlock map). */
export function getLocationsUnlockedByMission(missionId: string): string[] {
  return MISSION_UNLOCKS[missionId] ?? [];
}

/** Location ids that became accessible after a mission victory. */
export function getNewlyAccessibleLocations(
  before: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
  after: Pick<LocalSaveData, 'unlockedMissions' | 'completedMissions'>,
): string[] {
  const ids: string[] = [];
  for (const loc of LOCATIONS) {
    if (loc.type === 'camp') continue;
    const was = isLocationUnlocked(loc.id, loc.unlockRequirement, before);
    const now = isLocationUnlocked(loc.id, loc.unlockRequirement, after);
    if (!was && now) ids.push(loc.id);
  }
  return ids;
}

export function getLocationDisplayName(locationId: string): string {
  return getLocationById(locationId)?.name ?? locationId.replace(/-/g, ' ');
}

export function isPrimaryMapPath(from: string, to: string): boolean {
  return MAP_PATHS.some((p) => p.from === from && p.to === to && p.primary);
}
