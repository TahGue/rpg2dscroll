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
    ids.add('fire_tower');
    ids.add('fire_pot');
    ids.add('sand_pit');
  }
  if (ctx.completedMissions.includes('mission-silent-oasis')) {
    ids.add('repair_station');
    ids.add('water_tower');
    ids.add('water_slow_trap');
  }
  if (ctx.completedMissions.includes('mission-broken-watchtower')) {
    ids.add('iron_tower');
    ids.add('stone_wall');
    ids.add('ballista');
  }
  if (ctx.completedMissions.includes('mission-scorpion-nest')) {
    ids.add('poison_trap');
    ids.add('reinforced_wall');
    ids.add('spiked_wall');
  }
  if (ctx.completedMissions.includes('mission-shrine-sanctum')) {
    ids.add('relic_tower');
    ids.add('light_trap');
    ids.add('relic_wall');
  }
  if (ctx.completedMissions.includes('mission-black-eclipse')) {
    ids.add('rolling_stone');
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
      return ['repair_station', 'water_tower', 'water_slow_trap'];
    case 'mission-red-dune-pass':
      return ['barricade', 'fire_tower', 'fire_pot', 'sand_pit'];
    case 'mission-scorpion-nest':
      return ['poison_trap', 'reinforced_wall', 'spiked_wall'];
    case 'mission-broken-watchtower':
      return ['iron_tower', 'stone_wall', 'ballista'];
    case 'mission-shrine-sanctum':
      return ['relic_tower', 'light_trap', 'relic_wall'];
    case 'mission-black-eclipse':
      return ['rolling_stone'];
    default:
      return [];
  }
}

export function getBuildUnlockHint(id: BuildChoice): string | undefined {
  switch (id) {
    case 'barricade':
      return 'Red Dune Pass';
    case 'fire_tower':
    case 'fire_pot':
    case 'sand_pit':
      return 'Red Dune Pass';
    case 'repair_station':
      return 'Silent Oasis';
    case 'water_tower':
    case 'water_slow_trap':
      return 'Silent Oasis';
    case 'poison_trap':
    case 'reinforced_wall':
    case 'spiked_wall':
      return 'Scorpion Nest';
    case 'iron_tower':
      return 'Broken Watchtower';
    case 'stone_wall':
    case 'ballista':
      return 'Broken Watchtower';
    case 'relic_tower':
    case 'light_trap':
    case 'relic_wall':
      return 'Shrine Sanctum';
    case 'rolling_stone':
      return 'Black Eclipse Gate';
    case 'lion_den':
      return 'Lion + Lion Den camp';
    default:
      return undefined;
  }
}

export function getBuildUnlockAnnouncement(id: BuildChoice): string {
  const def = BUILD_OPTIONS.find((b) => b.id === id);
  return def ? `${def.name} unlocked for battle!` : `${id} unlocked!`;
}
