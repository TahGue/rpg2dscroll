import type { MissionBoostType } from '../shop/shopItems';
import { syncMaterialsToInventory } from '../world/materials';
import { DEFAULT_KEY_BINDINGS, type KeyBindings } from '../input/keyBindings';
import { isBattlePost, isDefenderPost, type BattlePost, type DefenderPost } from '../missions/battlePosts';
import type { DefenderChoice } from '../defenders/defenders';

export type LionMode = 'follow' | 'guard' | 'guard_left' | 'guard_right' | 'aggressive';

const LION_MODES: LionMode[] = ['follow', 'guard', 'guard_left', 'guard_right', 'aggressive'];
const DEFENDER_CHOICES: DefenderChoice[] = [
  'gate_guard',
  'archer',
  'repair_worker',
  'hunter',
  'shield_guard',
  'water_carrier',
  'torch_bearer',
];

export const LION_MODE_LABELS: Record<LionMode, string> = {
  follow: 'Follow Malik',
  guard: 'Guard Gate',
  guard_left: 'Guard Left',
  guard_right: 'Guard Right',
  aggressive: 'Hunt Foes',
};
export type BuildChoice =
  | 'arrow_tower'
  | 'fire_tower'
  | 'water_tower'
  | 'relic_tower'
  | 'ballista'
  | 'spike_trap'
  | 'fire_pot'
  | 'water_slow_trap'
  | 'poison_trap'
  | 'sand_pit'
  | 'light_trap'
  | 'rolling_stone'
  | 'barricade'
  | 'reinforced_wall'
  | 'stone_wall'
  | 'spiked_wall'
  | 'relic_wall'
  | 'repair_station'
  | 'iron_tower'
  | 'lion_den';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  keyBindings: KeyBindings;
}

export interface OverworldPosition {
  regionId: string;
  x: number;
  y: number;
}

export interface LocalSaveData {
  version: number;
  gold: number;
  water: number;
  iron: number;
  leather: number;
  wood: number;
  xp: number;
  level: number;
  completedMissions: string[];
  unlockedMissions: string[];
  bestScores: Record<string, number>;
  achievements: string[];
  unlockedLore: string[];
  restBonusActive: boolean;
  missionBoost: MissionBoostType | null;
  collectedResources: string[];
  seenActs: string[];
  seenCampDialog: boolean;
  upgrades: Record<string, number>;
  campUpgrades: Record<string, number>;
  relicLevels: Record<string, number>;
  inventory: Record<string, number>;
  selectedBuild: BuildChoice;
  lionMode: LionMode;
  ngPlusLevel: number;
  campaignComplete: boolean;
  settings: GameSettings;
  lastPlayedAt: string;
  overworldPosition: OverworldPosition;
  visitedOverworldPOIs: string[];
  openedOverworldChests: string[];
  exploredOverworldCells: string[];
  defeatedOverworldPatrols: string[];
  completedOverworldEvents: string[];
  /** Hero ids recruited in the overworld (e.g. aisha). */
  recruitedHeroes: string[];
  /** Last hero chosen on the prep screen. */
  selectedHeroId: string | null;
  /** Trap/tower blueprints discovered while exploring. */
  unlockedBlueprints: string[];
  /** Default gate guard assignment on prep screen. */
  prepUseGateGuard: boolean;
  /** Default hero battlefield post on wide prep missions. */
  prepHeroPost: BattlePost;
  /** Default NPC defender post on wide prep missions. */
  prepDefenderPost: DefenderPost;
  /** Default NPC defender type on prep missions. */
  prepDefenderId: DefenderChoice;
  /** Defense skill tree — Phase 1 uses build_speed, repair_speed, cheaper_towers. */
  defenseSkills: Record<string, number>;
  /** Regions the player has entered at least once. */
  visitedOverworldRegions: string[];
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  showDamageNumbers: true,
  keyBindings: DEFAULT_KEY_BINDINGS,
};

export const DEFAULT_SAVE: LocalSaveData = {
  version: 3,
  gold: 0,
  water: 0,
  iron: 0,
  leather: 0,
  wood: 0,
  xp: 0,
  level: 1,
  completedMissions: [],
  unlockedMissions: ['nahran-camp', 'night-attack'],
  bestScores: {},
  achievements: [],
  unlockedLore: ['lore-nahran'],
  restBonusActive: false,
  missionBoost: null,
  collectedResources: [],
  seenActs: [],
  seenCampDialog: false,
  upgrades: {
    sword_damage: 1,
    malik_hp: 1,
    gate_hp: 1,
    malik_speed: 1,
    block_strength: 1,
    repair_speed: 1,
    tower_damage: 1,
    lion_level: 0,
    sand_slash: 0,
    bow_level: 0,
    spear_level: 0,
  },
  campUpgrades: {},
  relicLevels: {},
  inventory: {},
  selectedBuild: 'arrow_tower',
  lionMode: 'guard',
  ngPlusLevel: 0,
  campaignComplete: false,
  settings: DEFAULT_SETTINGS,
  lastPlayedAt: new Date().toISOString(),
  overworldPosition: { regionId: 'nahran-outskirts', x: 520, y: 1280 },
  visitedOverworldPOIs: [],
  openedOverworldChests: [],
  exploredOverworldCells: [],
  defeatedOverworldPatrols: [],
  completedOverworldEvents: [],
  recruitedHeroes: [],
  selectedHeroId: null,
  unlockedBlueprints: ['arrow_tower'],
  prepUseGateGuard: true,
  prepHeroPost: 'gate',
  prepDefenderPost: 'gate',
  prepDefenderId: 'gate_guard',
  defenseSkills: {
    build_speed: 0,
    repair_speed: 0,
    cheaper_towers: 0,
  },
  visitedOverworldRegions: ['nahran-outskirts'],
};

export const SAVE_KEY = 'malik-desert-defense-save';

/** Merge persisted save with defaults so new fields always exist after updates. */
export function mergeSaveData(parsed: Partial<LocalSaveData>): LocalSaveData {
  const base: LocalSaveData = {
    ...DEFAULT_SAVE,
    ...parsed,
    settings: {
      ...DEFAULT_SETTINGS,
      ...parsed.settings,
      keyBindings: { ...DEFAULT_SETTINGS.keyBindings, ...parsed.settings?.keyBindings },
    },
    upgrades: { ...DEFAULT_SAVE.upgrades, ...parsed.upgrades },
    campUpgrades: { ...DEFAULT_SAVE.campUpgrades, ...parsed.campUpgrades },
    relicLevels: { ...DEFAULT_SAVE.relicLevels, ...parsed.relicLevels },
    inventory: { ...DEFAULT_SAVE.inventory, ...parsed.inventory },
    bestScores: parsed.bestScores ?? {},
    achievements: parsed.achievements ?? [],
    unlockedLore: parsed.unlockedLore ?? DEFAULT_SAVE.unlockedLore,
    collectedResources: parsed.collectedResources ?? [],
    seenActs: parsed.seenActs ?? [],
    restBonusActive: parsed.restBonusActive ?? false,
    missionBoost: parsed.missionBoost ?? null,
    water: parsed.water ?? 0,
    iron: parsed.iron ?? 0,
    leather: parsed.leather ?? 0,
    wood: parsed.wood ?? 0,
    selectedBuild: parsed.selectedBuild ?? DEFAULT_SAVE.selectedBuild,
    lionMode:
      parsed.lionMode && LION_MODES.includes(parsed.lionMode)
        ? parsed.lionMode
        : DEFAULT_SAVE.lionMode,
    ngPlusLevel: parsed.ngPlusLevel ?? 0,
    campaignComplete: parsed.campaignComplete ?? false,
    seenCampDialog: parsed.seenCampDialog ?? false,
    version: parsed.version ?? DEFAULT_SAVE.version,
    overworldPosition: parsed.overworldPosition ?? DEFAULT_SAVE.overworldPosition,
    visitedOverworldPOIs: parsed.visitedOverworldPOIs ?? [],
    openedOverworldChests: parsed.openedOverworldChests ?? [],
    exploredOverworldCells: parsed.exploredOverworldCells ?? [],
    defeatedOverworldPatrols: parsed.defeatedOverworldPatrols ?? [],
    completedOverworldEvents: parsed.completedOverworldEvents ?? [],
    recruitedHeroes: parsed.recruitedHeroes ?? [],
    selectedHeroId: parsed.selectedHeroId ?? null,
    unlockedBlueprints: parsed.unlockedBlueprints ?? DEFAULT_SAVE.unlockedBlueprints,
    prepUseGateGuard: parsed.prepUseGateGuard ?? true,
    prepHeroPost: isBattlePost(parsed.prepHeroPost) ? parsed.prepHeroPost : DEFAULT_SAVE.prepHeroPost,
    prepDefenderPost: isDefenderPost(parsed.prepDefenderPost)
      ? parsed.prepDefenderPost
      : parsed.prepUseGateGuard
        ? 'gate'
        : 'none',
    prepDefenderId:
      parsed.prepDefenderId && DEFENDER_CHOICES.includes(parsed.prepDefenderId)
        ? parsed.prepDefenderId
        : DEFAULT_SAVE.prepDefenderId,
    defenseSkills: { ...DEFAULT_SAVE.defenseSkills, ...parsed.defenseSkills },
    visitedOverworldRegions: parsed.visitedOverworldRegions ?? DEFAULT_SAVE.visitedOverworldRegions,
  };
  return {
    ...base,
    inventory: syncMaterialsToInventory(base),
  };
}
