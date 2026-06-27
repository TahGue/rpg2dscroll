import { create } from 'zustand';
import {
  DEFAULT_SAVE,
  applyXpGain,
  applyMissionUnlocks,
  calculateMissionScore,
  getMissionById,
  checkNewAchievements,
  checkMetaAchievements,
  calcSpeedBonus,
  getParTimeMs,
  getLoreIdsForMission,
  getActBannerAfterVictory,
  getUnseenActForMission,
  getResourceNode,
  getShopItem,
  getCampUpgrade,
  getRelicUpgrade,
  isRelicUnlocked,
  CAMP_ELDER_INTRO,
  getMissionInventoryReward,
  mergeSaveData,
  mergeCloudSaves,
  getNgPlusRewardMultiplier,
  addMaterialRewards,
  syncMaterialsToInventory,
  applyNgPlusReset,
  getCraftRecipe,
  getNewlyAccessibleLocations,
  cycleBuildChoice,
  isBuildUnlocked,
  getOverworldRegion,
  canFastTravelTo,
  type GameSettings,
  type LocalSaveData,
  type MissionType,
  type MissionBoostType,
  type BuildChoice,
  type LionMode,
  type ResourceRewards,
  type OverworldPOI,
} from '@malik/shared';
import { loadSave, persistSave, parseImportedSave } from '@/services/saveService';
import { pushCloudSave, submitScore } from '@/services/apiService';

export type GameScreen =
  | 'main_menu'
  | 'world_explore'
  | 'world_map'
  | 'mission'
  | 'upgrade'
  | 'camp_upgrades'
  | 'relic_upgrades'
  | 'inventory'
  | 'post_game'
  | 'mission_result'
  | 'settings'
  | 'login'
  | 'leaderboard'
  | 'achievements'
  | 'lore';

interface MissionRuntimeState {
  missionId: string | null;
  currentWave: number;
  totalWaves: number;
  enemiesRemaining: number;
  betweenWaves: boolean;
  preparing: boolean;
  awaitingWaveStart: boolean;
  playerHp: number;
  playerMaxHp: number;
  gateHp: number;
  gateMaxHp: number;
  goldCollected: number;
  enemiesKilled: number;
  isPaused: boolean;
  elapsedMs: number;
  objective: string;
  shieldBashCooldown: number;
  sandSlashCooldown: number;
  dodgeCooldown: number;
  sandSlashUnlocked: boolean;
  bowUnlocked: boolean;
  spearUnlocked: boolean;
  warCryUnlocked: boolean;
  sentinelUnlocked: boolean;
  isAmbush: boolean;
  isShrine: boolean;
  isCaravan: boolean;
  isSurvive: boolean;
  isOasis: boolean;
  surviveDurationMs: number;
  missionType: MissionType;
  bowCooldown: number;
  spearCooldown: number;
  warCryCooldown: number;
  sentinelCooldown: number;
  activeBoost: MissionBoostType | null;
  damageMultiplier: number;
  repairMultiplier: number;
  bossesKilled: string[];
  bossHp: number;
  bossMaxHp: number;
  bossName: string | null;
  bossPhase: number;
}

interface GameStore {
  screen: GameScreen;
  save: LocalSaveData;
  mission: MissionRuntimeState;
  authEmail: string | null;
  pendingActBanner: string | null;
  pendingDialog: { id: string; lines: typeof CAMP_ELDER_INTRO } | null;
  lastMissionResult: {
    missionId: string;
    missionType: MissionType;
    isAmbush: boolean;
    isShrine: boolean;
    isCaravan: boolean;
    isSurvive: boolean;
    isOasis: boolean;
    victory: boolean;
    goldEarned: number;
    waterEarned: number;
    xpEarned: number;
    enemiesKilled: number;
    gateHpRemaining: number;
    levelsGained: number;
    score: number;
    isNewBest: boolean;
    elapsedMs: number;
    speedBonusGold: number;
    newAchievements: string[];
    campaignJustCompleted: boolean;
    inventoryEarned: Record<string, number>;
    ngPlusBonusGold: number;
    ngPlusBonusXp: number;
    unlockedLocationIds: string[];
  } | null;
  /** Focus this map node when opening the world map (e.g. after victory). */
  mapFocusLocationId: string | null;
  /** One-shot toast when returning to map after unlocking locations. */
  mapUnlockAnnouncement: string[] | null;
  /** Mission to auto-start after act banner dismiss. */
  pendingMissionId: string | null;
  /** Screen to return to after mission abort/result. */
  missionReturnScreen: GameScreen;
  overworldInteract: { prompt: string | null; poiId: string | null; poi: OverworldPOI | null };
  overworldDialog: { npcId: string; name: string; lines: string[] } | null;
  overworldMissionOffer: {
    missionId: string;
    title: string;
    brief: string;
    returnX: number;
    returnY: number;
  } | null;
  overworldCampOpen: boolean;
  overworldMapOpen: boolean;
  overworldUnlockToast: string | null;
  /** Live player position for minimap — updated from Phaser, avoids re-rendering full save every frame. */
  overworldLivePosition: { x: number; y: number };
  /** Where sub-screens (inventory, upgrades) return to. */
  mapHomeScreen: GameScreen;

  setScreen: (screen: GameScreen) => void;
  startMission: (missionId: string, returnScreen?: GameScreen) => void;
  abortMission: () => void;
  endMission: (result: Omit<NonNullable<GameStore['lastMissionResult']>, 'missionId' | 'levelsGained' | 'score' | 'isNewBest' | 'elapsedMs' | 'speedBonusGold' | 'newAchievements' | 'missionType' | 'isAmbush' | 'isShrine' | 'isCaravan' | 'isSurvive' | 'isOasis' | 'waterEarned' | 'campaignJustCompleted' | 'inventoryEarned' | 'ngPlusBonusGold' | 'ngPlusBonusXp' | 'unlockedLocationIds'>) => void;
  updateMissionRuntime: (partial: Partial<MissionRuntimeState>) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  spendWater: (amount: number) => boolean;
  spendIron: (amount: number) => boolean;
  spendLeather: (amount: number) => boolean;
  spendWood: (amount: number) => boolean;
  upgradeLevel: (upgradeId: string) => boolean;
  purchaseCampUpgrade: (upgradeId: string) => boolean;
  purchaseRelic: (relicId: string) => boolean;
  useInventoryItem: (itemId: string) => boolean;
  setSelectedBuild: (build: BuildChoice) => void;
  cycleBuildInMission: () => void;
  setLionMode: (mode: LionMode) => void;
  startNGPlus: () => void;
  resetSave: () => void;
  togglePause: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setAuthEmail: (email: string | null) => void;
  loadSaveData: (save: LocalSaveData) => void;
  pullCloudSave: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  logout: () => void;
  restAtCamp: () => void;
  purchaseShopItem: (itemId: string) => boolean;
  collectResource: (locationId: string) => ResourceRewards | null;
  craftItem: (recipeId: string) => boolean;
  importSaveFromJson: (raw: string) => boolean;
  unlockLore: (loreId: string) => void;
  dismissActBanner: () => void;
  checkInitialActBanner: () => void;
  showCampIntroIfNeeded: () => void;
  dismissDialog: () => void;
  clearMapFocus: () => void;
  setOverworldInteract: (payload: GameStore['overworldInteract']) => void;
  setOverworldDialog: (dialog: GameStore['overworldDialog']) => void;
  setOverworldMissionOffer: (offer: GameStore['overworldMissionOffer']) => void;
  setOverworldCampOpen: (open: boolean) => void;
  dismissOverworldDialog: () => void;
  acceptOverworldMission: () => void;
  refreshOverworldAfterMission: () => void;
  setOverworldMapOpen: (open: boolean) => void;
  toggleOverworldMap: () => void;
  fastTravelTo: (poiId: string) => boolean;
}

const defaultMissionState = (): MissionRuntimeState => ({
  missionId: null,
  currentWave: 0,
  totalWaves: 0,
  enemiesRemaining: 0,
  betweenWaves: false,
  preparing: false,
  awaitingWaveStart: false,
  playerHp: 100,
  playerMaxHp: 100,
  gateHp: 500,
  gateMaxHp: 500,
  goldCollected: 0,
  enemiesKilled: 0,
  isPaused: false,
  elapsedMs: 0,
  objective: '',
  shieldBashCooldown: 1,
  sandSlashCooldown: 1,
  dodgeCooldown: 1,
  sandSlashUnlocked: false,
  bowUnlocked: false,
  spearUnlocked: false,
  warCryUnlocked: false,
  sentinelUnlocked: false,
  isAmbush: false,
  isShrine: false,
  isCaravan: false,
  isSurvive: false,
  isOasis: false,
  surviveDurationMs: 0,
  missionType: 'gate_defense',
  bowCooldown: 1,
  spearCooldown: 1,
  warCryCooldown: 1,
  sentinelCooldown: 1,
  activeBoost: null,
  damageMultiplier: 1,
  repairMultiplier: 1,
  bossesKilled: [],
  bossHp: 0,
  bossMaxHp: 0,
  bossName: null,
  bossPhase: 0,
});

function applyMetaAchievements(save: LocalSaveData): LocalSaveData {
  const newAchievements = checkMetaAchievements(save);
  if (newAchievements.length === 0) return save;
  return { ...save, achievements: [...new Set([...save.achievements, ...newAchievements])] };
}

function gateMaxFromSave(save: LocalSaveData): number {
  const level = save.upgrades.gate_hp ?? 1;
  const camp = (save.campUpgrades.gate_workshop ?? 0) * 40;
  const timber = (save.campUpgrades.palm_timbers ?? 0) * 25;
  return 500 + (level - 1) * 50 + camp + timber;
}

function playerMaxFromSave(save: LocalSaveData): number {
  const level = save.upgrades.malik_hp ?? 1;
  return 100 + (level - 1) * 15 + Math.max(0, save.level - 1) * 5;
}

function shopDiscount(save: LocalSaveData): number {
  return (save.campUpgrades.merchant_tents ?? 0) * 0.1;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'main_menu',
  save: loadSave(),
  mission: defaultMissionState(),
  authEmail: localStorage.getItem('malik-auth-email'),
  pendingActBanner: null,
  pendingDialog: null,
  lastMissionResult: null,
  mapFocusLocationId: null,
  mapUnlockAnnouncement: null,
  pendingMissionId: null,
  missionReturnScreen: 'world_explore',
  overworldInteract: { prompt: null, poiId: null, poi: null },
  overworldDialog: null,
  overworldMissionOffer: null,
  overworldCampOpen: false,
  overworldMapOpen: false,
  overworldUnlockToast: null,
  overworldLivePosition: { x: 520, y: 1280 },
  mapHomeScreen: 'world_explore',

  setScreen: (screen) => set({ screen }),

  clearMapFocus: () => set({ mapFocusLocationId: null }),

  setOverworldInteract: (payload) => set({ overworldInteract: payload }),
  setOverworldDialog: (dialog) => set({ overworldDialog: dialog }),
  setOverworldMissionOffer: (offer) => set({ overworldMissionOffer: offer }),
  setOverworldCampOpen: (open) => set({ overworldCampOpen: open }),
  dismissOverworldDialog: () => set({ overworldDialog: null }),

  acceptOverworldMission: () => {
    const { overworldMissionOffer } = get();
    if (!overworldMissionOffer) return;
    const { missionId } = overworldMissionOffer;
    set({ overworldMissionOffer: null });
    const unseenAct = getUnseenActForMission(missionId, get().save.seenActs);
    if (unseenAct) {
      set({ pendingActBanner: unseenAct, pendingMissionId: missionId, missionReturnScreen: 'world_explore' });
      return;
    }
    get().startMission(missionId, 'world_explore');
  },

  refreshOverworldAfterMission: () => {
    const { lastMissionResult } = get();
    if (lastMissionResult?.victory && lastMissionResult.unlockedLocationIds.length > 0) {
      set({ overworldUnlockToast: 'New paths revealed in the desert' });
      window.setTimeout(() => set({ overworldUnlockToast: null }), 5000);
    }
  },

  setOverworldMapOpen: (open) => set({ overworldMapOpen: open }),
  toggleOverworldMap: () => set((s) => ({ overworldMapOpen: !s.overworldMapOpen })),

  fastTravelTo: (poiId) => {
    const { save } = get();
    const regionId = save.overworldPosition.regionId || 'nahran-outskirts';
    const region = getOverworldRegion(regionId);
    const poi = region.pois.find((p) => p.id === poiId);
    if (!poi || !canFastTravelTo(poi, save)) return false;
    const updated = {
      ...save,
      overworldPosition: { regionId, x: poi.x, y: poi.y },
    };
    persistSave(updated);
    set({
      save: updated,
      overworldLivePosition: { x: poi.x, y: poi.y },
      overworldCampOpen: false,
    });
    return true;
  },

  abortMission: () => {
    const { save, mission } = get();
    let updatedSave = save;
    if (mission.activeBoost) {
      updatedSave = { ...save, missionBoost: mission.activeBoost };
      persistSave(updatedSave);
    }
    set({
      save: updatedSave,
      mission: defaultMissionState(),
      screen: get().missionReturnScreen,
    });
  },

  startMission: (missionId, returnScreen) => {
    const save = get().save;
    const missionDef = getMissionById(missionId);
    let playerMaxHp = playerMaxFromSave(save);
    const gateMaxHp = gateMaxFromSave(save);

    let updatedSave = save;
    if (save.restBonusActive) {
      playerMaxHp = Math.round(playerMaxHp * 1.1);
      updatedSave = { ...updatedSave, restBonusActive: false };
    }

    const boost = updatedSave.missionBoost;
    let damageMultiplier = 1 + (updatedSave.campUpgrades.war_camp ?? 0) * 0.05;
    let repairMultiplier = 1;
    if (boost === 'hp') {
      playerMaxHp = Math.round(playerMaxHp * 1.25);
    } else if (boost === 'damage') {
      damageMultiplier *= 1.2;
    } else if (boost === 'repair') {
      repairMultiplier = 2;
    }

    if (boost) {
      updatedSave = { ...updatedSave, missionBoost: null };
      persistSave(updatedSave);
    }

    const isAmbush = missionDef?.type === 'ambush';
    const isShrine = missionDef?.type === 'shrine';
    const isCaravan = missionDef?.type === 'caravan';
    const isSurvive = missionDef?.type === 'survive';
    const isOasis = missionDef?.type === 'oasis';

    set({
      screen: 'mission',
      missionReturnScreen: returnScreen ?? get().missionReturnScreen,
      save: updatedSave,
      mission: {
        ...defaultMissionState(),
        missionId,
        totalWaves: missionDef?.waves.length ?? 0,
        objective: missionDef?.objective ?? 'Protect the gate.',
        sandSlashUnlocked: (updatedSave.upgrades.sand_slash ?? 0) >= 1,
        bowUnlocked: (updatedSave.upgrades.bow_level ?? 0) >= 1,
        spearUnlocked: (updatedSave.upgrades.spear_level ?? 0) >= 1,
        warCryUnlocked: (updatedSave.relicLevels.sun_strike ?? 0) >= 1,
        sentinelUnlocked: (updatedSave.relicLevels.sentinel_shield ?? 0) >= 1,
        isAmbush,
        isShrine,
        isCaravan,
        isSurvive,
        isOasis,
        surviveDurationMs: missionDef?.surviveDurationMs ?? 0,
        missionType: missionDef?.type ?? 'gate_defense',
        playerMaxHp,
        playerHp: playerMaxHp,
        gateMaxHp: isAmbush ? 0 : gateMaxHp,
        gateHp: isAmbush ? 0 : gateMaxHp,
        activeBoost: boost,
        damageMultiplier,
        repairMultiplier,
      },
      lastMissionResult: null,
    });
  },

  endMission: (result) => {
    const { save, mission } = get();
    const missionId = mission.missionId;
    const missionDef = missionId ? getMissionById(missionId) : undefined;
    const elapsedMs = mission.elapsedMs;
    const parTimeMs = getParTimeMs(missionDef?.difficulty ?? 1);
    const ngRewardMult = getNgPlusRewardMultiplier(save.ngPlusLevel);
    const scaledGoldEarned = Math.round(result.goldEarned * ngRewardMult);
    const scaledXpEarned = Math.round(result.xpEarned * ngRewardMult);
    const ngPlusBonusGold = scaledGoldEarned - result.goldEarned;
    const ngPlusBonusXp = scaledXpEarned - result.xpEarned;

    const speedBonusGold = result.victory ? calcSpeedBonus(elapsedMs, parTimeMs, missionDef?.difficulty ?? 1) : 0;
    const totalGold = scaledGoldEarned + speedBonusGold;

    const xpResult = applyXpGain(save.xp, save.level, scaledXpEarned);

    const score = calculateMissionScore({
      victory: result.victory,
      gateHpRemaining: result.gateHpRemaining,
      gateMaxHp: mission.gateMaxHp,
      enemiesKilled: result.enemiesKilled,
      goldEarned: totalGold,
      difficulty: missionDef?.difficulty ?? 1,
    });

    const prevBest = missionId ? (save.bestScores[missionId] ?? 0) : 0;
    const isNewBest = result.victory && !!missionId && score > prevBest;

    let waterEarned = 0;
    if (result.victory && missionDef?.type === 'oasis') {
      waterEarned = 1;
      if (mission.gateMaxHp > 0 && result.gateHpRemaining >= mission.gateMaxHp) {
        waterEarned += 1;
      }
    }

    const campaignJustCompleted =
      result.victory && missionId === 'mission-shadow-emir' && !save.campaignComplete;

    let inventoryEarned: Record<string, number> = {};

    let updatedSave: LocalSaveData = {
      ...save,
      gold: save.gold + totalGold,
      water: (save.water ?? 0) + waterEarned,
      xp: xpResult.xp,
      level: xpResult.level,
      bestScores: missionId
        ? { ...save.bestScores, [missionId]: Math.max(prevBest, score) }
        : save.bestScores,
      achievements: [...save.achievements],
      unlockedLore: [...save.unlockedLore],
      campaignComplete: save.campaignComplete || campaignJustCompleted,
      lastPlayedAt: new Date().toISOString(),
    };

    if (result.victory && missionId) {
      if (!updatedSave.completedMissions.includes(missionId)) {
        updatedSave.completedMissions.push(missionId);
      }
      updatedSave.unlockedMissions = applyMissionUnlocks(
        updatedSave.completedMissions,
        updatedSave.unlockedMissions,
        missionId,
      );

      const wasFirstClear = !save.completedMissions.includes(missionId);
      if (wasFirstClear) {
        inventoryEarned = getMissionInventoryReward(missionId);
        const inventory = { ...updatedSave.inventory };
        for (const [itemId, qty] of Object.entries(inventoryEarned)) {
          inventory[itemId] = (inventory[itemId] ?? 0) + qty;
        }
        updatedSave.inventory = inventory;
      }
    }

    const newAchievements = checkNewAchievements(updatedSave, {
      victory: result.victory,
      missionId: missionId ?? '',
      gateHpRemaining: result.gateHpRemaining,
      gateMaxHp: mission.gateMaxHp,
      elapsedMs,
      parTimeMs,
      enemiesKilled: result.enemiesKilled,
      bossesKilled: mission.bossesKilled,
    });
    updatedSave.achievements = [...new Set([...updatedSave.achievements, ...newAchievements])];

    if (result.victory && missionId) {
      const loreIds = getLoreIdsForMission(missionId);
      updatedSave.unlockedLore = [...new Set([...updatedSave.unlockedLore, ...loreIds])];
    }

    persistSave(updatedSave);
    if (get().authEmail) {
      void pushCloudSave(updatedSave).catch(() => {});
      if (result.victory && missionId) void submitScore(missionId, score).catch(() => {});
    }

    const nextAct =
      result.victory && missionId
        ? getActBannerAfterVictory(missionId, updatedSave.seenActs)
        : null;

    const unlockedLocationIds =
      result.victory && missionId ? getNewlyAccessibleLocations(save, updatedSave) : [];

    set({
      save: updatedSave,
      pendingActBanner: nextAct,
      lastMissionResult: {
        ...result,
        goldEarned: totalGold,
        xpEarned: scaledXpEarned,
        missionId: missionId ?? '',
        missionType: missionDef?.type ?? 'gate_defense',
        isAmbush: missionDef?.type === 'ambush',
        isShrine: missionDef?.type === 'shrine',
        isCaravan: missionDef?.type === 'caravan',
        isSurvive: missionDef?.type === 'survive',
        isOasis: missionDef?.type === 'oasis',
        waterEarned,
        levelsGained: xpResult.levelsGained,
        score,
        isNewBest,
        elapsedMs,
        speedBonusGold,
        newAchievements,
        campaignJustCompleted,
        inventoryEarned,
        ngPlusBonusGold,
        ngPlusBonusXp,
        unlockedLocationIds,
      },
      screen: 'mission_result',
      mission: defaultMissionState(),
    });
  },

  updateMissionRuntime: (partial) =>
    set((state) => ({ mission: { ...state.mission, ...partial } })),

  addGold: (amount) => {
    const updated = applyMetaAchievements({ ...get().save, gold: get().save.gold + amount });
    persistSave(updated);
    set({ save: updated });
  },

  spendGold: (amount) => {
    const { save } = get();
    if (save.gold < amount) return false;
    const updated = { ...save, gold: save.gold - amount };
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
    return true;
  },

  spendWater: (amount) => {
    const { save } = get();
    if ((save.water ?? 0) < amount) return false;
    const updated = { ...save, water: save.water - amount };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  spendIron: (amount) => {
    const { save } = get();
    if (save.iron < amount) return false;
    const iron = save.iron - amount;
    const updated = {
      ...save,
      iron,
      inventory: syncMaterialsToInventory({ ...save, iron }),
    };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  spendLeather: (amount) => {
    const { save } = get();
    if (save.leather < amount) return false;
    const leather = save.leather - amount;
    const updated = {
      ...save,
      leather,
      inventory: syncMaterialsToInventory({ ...save, leather }),
    };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  spendWood: (amount) => {
    const { save } = get();
    if ((save.wood ?? 0) < amount) return false;
    const updated = { ...save, wood: save.wood - amount };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  upgradeLevel: (upgradeId) => {
    const { save } = get();
    const current = save.upgrades[upgradeId] ?? (upgradeId === 'lion_level' || upgradeId === 'sand_slash' || upgradeId === 'bow_level' || upgradeId === 'spear_level' ? 0 : 1);
    const updated = applyMetaAchievements({
      ...save,
      upgrades: { ...save.upgrades, [upgradeId]: current + 1 },
    });
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
    return true;
  },

  purchaseCampUpgrade: (upgradeId) => {
    const def = getCampUpgrade(upgradeId);
    if (!def) return false;

    const { save, spendGold, spendWater, spendIron, spendLeather, spendWood } = get();
    const current = save.campUpgrades[upgradeId] ?? 0;
    if (current >= def.maxLevel) return false;

    if (!spendGold(def.goldCost)) return false;
    if (def.waterCost > 0 && !spendWater(def.waterCost)) {
      get().addGold(def.goldCost);
      return false;
    }
    if (def.ironCost > 0 && !spendIron(def.ironCost)) {
      get().addGold(def.goldCost);
      if (def.waterCost > 0) {
        const s = get().save;
        persistSave({ ...s, water: s.water + def.waterCost });
        set({ save: { ...s, water: s.water + def.waterCost } });
      }
      return false;
    }
    if (def.leatherCost > 0 && !spendLeather(def.leatherCost)) {
      get().addGold(def.goldCost);
      return false;
    }
    if (def.woodCost > 0 && !spendWood(def.woodCost)) {
      get().addGold(def.goldCost);
      return false;
    }

    const updated = {
      ...get().save,
      campUpgrades: { ...get().save.campUpgrades, [upgradeId]: current + 1 },
    };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  purchaseRelic: (relicId) => {
    const def = getRelicUpgrade(relicId);
    if (!def) return false;

    const { save, spendGold, spendWater } = get();
    if (!isRelicUnlocked(relicId, save.completedMissions)) return false;

    const current = save.relicLevels[relicId] ?? 0;
    if (current >= def.maxLevel) return false;

    const shards = save.inventory.relic_shard ?? 0;
    const waterCost = Math.max(0, def.waterCost - (shards > 0 ? 1 : 0));
    const useShard = shards > 0 && def.waterCost > 0;

    if (!spendGold(def.goldCost)) return false;
    if (waterCost > 0 && !spendWater(waterCost)) {
      get().addGold(def.goldCost);
      return false;
    }

    const inventory = { ...get().save.inventory };
    if (useShard) {
      inventory.relic_shard = shards - 1;
      if (inventory.relic_shard <= 0) delete inventory.relic_shard;
    }

    const updated = {
      ...get().save,
      inventory,
      relicLevels: { ...get().save.relicLevels, [relicId]: current + 1 },
    };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  useInventoryItem: (itemId) => {
    const { save } = get();
    const count = save.inventory[itemId] ?? 0;
    if (count <= 0 || save.missionBoost) return false;

    const boostMap: Record<string, MissionBoostType> = {
      dates: 'hp',
      ointment: 'repair',
      firestones: 'damage',
    };
    const boost = boostMap[itemId];
    if (!boost) return false;

    const updated = {
      ...save,
      inventory: { ...save.inventory, [itemId]: count - 1 },
      missionBoost: boost,
    };
    persistSave(updated);
    set({ save: updated });
    return true;
  },

  setSelectedBuild: (build) => {
    const save = get().save;
    const ctx = {
      completedMissions: save.completedMissions,
      lionLevel: save.upgrades.lion_level ?? 0,
      lionDenCampLevel: save.campUpgrades.lion_den ?? 0,
    };
    if (!isBuildUnlocked(build, ctx)) return;
    const updated = { ...save, selectedBuild: build };
    persistSave(updated);
    set({ save: updated });
  },

  cycleBuildInMission: () => {
    const save = get().save;
    const ctx = {
      completedMissions: save.completedMissions,
      lionLevel: save.upgrades.lion_level ?? 0,
      lionDenCampLevel: save.campUpgrades.lion_den ?? 0,
    };
    const next = cycleBuildChoice(save.selectedBuild, ctx);
    const updated = { ...save, selectedBuild: next };
    persistSave(updated);
    set({ save: updated });
  },

  setLionMode: (mode) => {
    const updated = { ...get().save, lionMode: mode };
    persistSave(updated);
    set({ save: updated });
  },

  startNGPlus: () => {
    let updated = applyNgPlusReset(get().save);
    updated = applyMetaAchievements(updated);
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated, screen: 'world_explore', mapUnlockAnnouncement: null });
  },

  resetSave: () => {
    persistSave(DEFAULT_SAVE);
    set({ save: DEFAULT_SAVE });
  },

  togglePause: () =>
    set((state) => ({ mission: { ...state.mission, isPaused: !state.mission.isPaused } })),

  updateSettings: (settings) => {
    const updated: LocalSaveData = {
      ...get().save,
      settings: { ...get().save.settings, ...settings },
    };
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
  },

  setAuthEmail: (email) => {
    if (email) localStorage.setItem('malik-auth-email', email);
    else localStorage.removeItem('malik-auth-email');
    set({ authEmail: email });
  },

  loadSaveData: (save) => {
    const merged = mergeSaveData(save);
    persistSave(merged);
    set({
      save: merged,
      overworldLivePosition: merged.overworldPosition ?? { x: 520, y: 1280 },
    });
  },

  pullCloudSave: async () => {
    if (!get().authEmail) return;
    try {
      const { fetchCloudSave, pushCloudSave } = await import('@/services/apiService');
      const cloud = await fetchCloudSave();
      const merged = mergeCloudSaves(get().save, cloud);
      persistSave(merged);
      set({ save: merged });
      void pushCloudSave(merged).catch(() => {});
    } catch {
      // Server offline — keep local save
    }
  },

  syncToCloud: async () => {
    if (!get().authEmail) return;
    await pushCloudSave(get().save);
  },

  logout: () => {
    localStorage.removeItem('malik-auth-token');
    localStorage.removeItem('malik-auth-email');
    set({ authEmail: null });
  },

  restAtCamp: () => {
    const updated = { ...get().save, restBonusActive: true };
    persistSave(updated);
    set({ save: updated });
  },

  purchaseShopItem: (itemId) => {
    const item = getShopItem(itemId);
    if (!item) return false;

    const { save, spendGold } = get();
    const cost = Math.max(1, Math.round(item.cost * (1 - shopDiscount(save))));
    if (!spendGold(cost)) return false;

    const updated = {
      ...get().save,
      inventory: {
        ...get().save.inventory,
        [itemId]: (get().save.inventory[itemId] ?? 0) + 1,
      },
    };
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
    return true;
  },

  collectResource: (locationId) => {
    const def = getResourceNode(locationId);
    if (!def) return null;

    const { save } = get();
    if (save.collectedResources.includes(locationId)) return null;

    const materialUpdate = addMaterialRewards(save, {
      iron: def.ironReward,
      leather: def.leatherReward,
      wood: def.woodReward,
    });

    const updated: LocalSaveData = applyMetaAchievements({
      ...save,
      ...materialUpdate,
      gold: save.gold + def.goldReward,
      water: (save.water ?? 0) + def.waterReward,
      collectedResources: [...save.collectedResources, locationId],
      unlockedLore: save.unlockedLore.includes(def.loreId)
        ? save.unlockedLore
        : [...save.unlockedLore, def.loreId],
    });
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
    return {
      gold: def.goldReward,
      water: def.waterReward,
      iron: def.ironReward,
      leather: def.leatherReward,
      wood: def.woodReward,
      loreId: def.loreId,
    };
  },

  craftItem: (recipeId) => {
    const recipe = getCraftRecipe(recipeId);
    if (!recipe) return false;

    const { save } = get();
    if (
      recipe.requiresCompletedMission &&
      !save.completedMissions.includes(recipe.requiresCompletedMission)
    ) {
      return false;
    }

    if (recipe.ironCost && save.iron < recipe.ironCost) return false;
    if (recipe.leatherCost && save.leather < recipe.leatherCost) return false;
    if (recipe.woodCost && (save.wood ?? 0) < recipe.woodCost) return false;

    if (recipe.inventoryCosts) {
      for (const [itemId, qty] of Object.entries(recipe.inventoryCosts)) {
        if ((save.inventory[itemId] ?? 0) < qty) return false;
      }
    }

    const { spendIron, spendLeather, spendWood } = get();
    if (recipe.ironCost && !spendIron(recipe.ironCost)) return false;
    if (recipe.leatherCost && !spendLeather(recipe.leatherCost)) return false;
    if (recipe.woodCost && !spendWood(recipe.woodCost)) return false;

    const inventory = { ...get().save.inventory };
    if (recipe.inventoryCosts) {
      for (const [itemId, qty] of Object.entries(recipe.inventoryCosts)) {
        inventory[itemId] = (inventory[itemId] ?? 0) - qty;
        if (inventory[itemId] <= 0) delete inventory[itemId];
      }
    }

    inventory[recipe.outputItemId] =
      (inventory[recipe.outputItemId] ?? 0) + recipe.outputQuantity;

    const updated = { ...get().save, inventory };
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
    return true;
  },

  importSaveFromJson: (raw) => {
    try {
      const merged = parseImportedSave(raw);
      persistSave(merged);
      if (get().authEmail) void pushCloudSave(merged).catch(() => {});
      set({ save: merged });
      return true;
    } catch {
      return false;
    }
  },

  unlockLore: (loreId) => {
    const { save } = get();
    if (save.unlockedLore.includes(loreId)) return;
    const updated = { ...save, unlockedLore: [...save.unlockedLore, loreId] };
    persistSave(updated);
    if (get().authEmail) void pushCloudSave(updated).catch(() => {});
    set({ save: updated });
  },

  dismissActBanner: () => {
    const { pendingActBanner, pendingMissionId, save } = get();
    if (!pendingActBanner) return;
    const seenActs = save.seenActs.includes(pendingActBanner)
      ? save.seenActs
      : [...save.seenActs, pendingActBanner];
    const updated = { ...save, seenActs };
    persistSave(updated);
    set({ save: updated, pendingActBanner: null, pendingMissionId: null });
    if (pendingMissionId) {
      get().startMission(pendingMissionId, get().missionReturnScreen);
    }
  },

  checkInitialActBanner: () => {
    const { save, pendingActBanner } = get();
    if (pendingActBanner) return;
    const act1 = getUnseenActForMission('mission-night-attack', save.seenActs);
    if (act1) set({ pendingActBanner: act1 });
  },

  showCampIntroIfNeeded: () => {
    const { save } = get();
    if (save.seenCampDialog) return;
    const updated = { ...save, seenCampDialog: true };
    persistSave(updated);
    set({
      save: updated,
      pendingDialog: { id: 'camp_intro', lines: CAMP_ELDER_INTRO },
    });
  },

  dismissDialog: () => set({ pendingDialog: null }),
}));
