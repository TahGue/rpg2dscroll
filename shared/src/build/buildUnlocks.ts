import type { BuildChoice } from '../types/save';
import { BUILD_OPTIONS } from './buildDefinitions';

export interface BuildUnlockContext {
  completedMissions: string[];
  lionLevel: number;
  lionDenCampLevel: number;
}

export function getUnlockedBuildIds(ctx: BuildUnlockContext): BuildChoice[] {
  const ids: BuildChoice[] = ['arrow_tower', 'spike_trap'];

  if (ctx.completedMissions.includes('mission-red-dune-pass')) {
    ids.push('barricade');
  }
  if (ctx.completedMissions.includes('mission-silent-oasis')) {
    ids.push('repair_station');
  }
  if (ctx.completedMissions.includes('mission-broken-watchtower')) {
    ids.push('iron_tower');
  }
  if (ctx.lionLevel >= 1 && ctx.lionDenCampLevel >= 1) {
    ids.push('lion_den');
  }

  return ids;
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
