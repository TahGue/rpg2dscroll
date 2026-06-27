import type { BuildChoice } from '../types/save';
import { BUILD_OPTIONS } from './buildDefinitions';
import { DEFAULT_BLUEPRINTS } from './blueprints';

export interface BuildUnlockContext {
  completedMissions: string[];
  lionLevel: number;
  lionDenCampLevel: number;
  unlockedBlueprints?: string[];
  /** When true, only blueprint + basic defaults apply (Nahran prep missions). */
  strictBlueprintsOnly?: boolean;
}

const ALL_BUILD_IDS = BUILD_OPTIONS.map((b) => b.id as BuildChoice);

function blueprintBuilds(blueprints: string[]): BuildChoice[] {
  return ALL_BUILD_IDS.filter((id) => blueprints.includes(id));
}

export function getUnlockedBuildIds(ctx: BuildUnlockContext): BuildChoice[] {
  const blueprints = ctx.unlockedBlueprints ?? DEFAULT_BLUEPRINTS;
  const ids = new Set<BuildChoice>(blueprintBuilds(blueprints));

  if (ctx.strictBlueprintsOnly) {
    return [...ids];
  }

  if (ctx.completedMissions.includes('mission-red-dune-pass')) {
    ids.add('barricade');
  }
  if (ctx.completedMissions.includes('mission-silent-oasis')) {
    ids.add('repair_station');
  }
  if (ctx.completedMissions.includes('mission-broken-watchtower')) {
    ids.add('iron_tower');
  }
  if (ctx.lionLevel >= 1 && ctx.lionDenCampLevel >= 1) {
    ids.add('lion_den');
  }

  if (ids.size === 0) ids.add('arrow_tower');
  return [...ids];
}

export function cycleBuildChoice(current: BuildChoice, ctx: BuildUnlockContext): BuildChoice {
  const unlocked = getUnlockedBuildIds(ctx);
  if (unlocked.length === 0) return 'arrow_tower';
  const idx = unlocked.indexOf(current);
  const next = idx < 0 ? 0 : (idx + 1) % unlocked.length;
  return unlocked[next]!;
}

export function isBuildUnlocked(id: BuildChoice, ctx: BuildUnlockContext): boolean {
  return getUnlockedBuildIds(ctx).includes(id);
}

export function getBuildDisplayOrder(): BuildChoice[] {
  return BUILD_OPTIONS.map((b) => b.id as BuildChoice);
}

/** Build types first unlocked by completing this mission. */
export function getBuildUnlocksGrantedByMission(missionId: string): BuildChoice[] {
  switch (missionId) {
    case 'mission-silent-oasis':
      return ['repair_station'];
    case 'mission-red-dune-pass':
      return ['barricade'];
    case 'mission-broken-watchtower':
      return ['iron_tower'];
    default:
      return [];
  }
}

export function getBuildUnlockHint(id: BuildChoice): string | undefined {
  switch (id) {
    case 'barricade':
      return 'Red Dune Pass';
    case 'repair_station':
      return 'Silent Oasis';
    case 'iron_tower':
      return 'Broken Watchtower';
    case 'lion_den':
      return 'Lion + Lion Den camp';
    default:
      return undefined;
  }
}
