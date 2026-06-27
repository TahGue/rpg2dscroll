import {
  getBuildDefinition,
  getLevelDamageBonus,
  getLevelHpBonus,
  getNgPlusMultiplier,
  getBuildGoldDiscount,
  getDefenseRepairMultiplier,
  getHero,
  type BuildUnlockContext,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { persistSave } from '@/services/saveService';

export class MissionBridge {
  static syncPlayer(hp: number, maxHp: number): void {
    useGameStore.getState().updateMissionRuntime({ playerHp: hp, playerMaxHp: maxHp });
  }

  static syncGate(hp: number, maxHp: number): void {
    useGameStore.getState().updateMissionRuntime({ gateHp: hp, gateMaxHp: maxHp });
  }

  static syncWave(wave: number, enemiesRemaining: number): void {
    useGameStore.getState().updateMissionRuntime({ currentWave: wave, enemiesRemaining });
  }

  static syncWaveBreak(betweenWaves: boolean): void {
    useGameStore.getState().updateMissionRuntime({ betweenWaves });
  }

  static syncPreparing(preparing: boolean): void {
    useGameStore.getState().updateMissionRuntime({ preparing });
  }

  static syncAwaitingWaveStart(awaitingWaveStart: boolean): void {
    useGameStore.getState().updateMissionRuntime({ awaitingWaveStart });
  }

  static syncBoss(hp: number, maxHp: number, name: string | null, phase = 0): void {
    useGameStore.getState().updateMissionRuntime({
      bossHp: hp,
      bossMaxHp: maxHp,
      bossName: name,
      bossPhase: phase,
    });
  }

  static clearBoss(): void {
    MissionBridge.syncBoss(0, 0, null, 0);
  }

  static syncTotalWaves(totalWaves: number): void {
    useGameStore.getState().updateMissionRuntime({ totalWaves });
  }

  static syncTimer(elapsedMs: number): void {
    useGameStore.getState().updateMissionRuntime({ elapsedMs });
  }

  static syncShieldBashCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ shieldBashCooldown: pct });
  }

  static syncSandSlashCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ sandSlashCooldown: pct });
  }

  static syncDodgeCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ dodgeCooldown: pct });
  }

  static syncBowCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ bowCooldown: pct });
  }

  static syncSpearCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ spearCooldown: pct });
  }

  static syncWarCryCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ warCryCooldown: pct });
  }

  static syncSentinelCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ sentinelCooldown: pct });
  }

  static isBowUnlocked(): boolean {
    return (useGameStore.getState().save.upgrades.bow_level ?? 0) >= 1;
  }

  static getBowDamage(): number {
    const level = useGameStore.getState().save.upgrades.bow_level ?? 0;
    return Math.round((12 + Math.max(0, level - 1) * 4) * this.getDamageMultiplier());
  }

  static isSpearUnlocked(): boolean {
    return (useGameStore.getState().save.upgrades.spear_level ?? 0) >= 1;
  }

  static getSpearDamage(): number {
    const level = useGameStore.getState().save.upgrades.spear_level ?? 0;
    return Math.round((18 + Math.max(0, level - 1) * 5) * this.getDamageMultiplier());
  }

  static isSandSlashUnlocked(): boolean {
    return (useGameStore.getState().save.upgrades.sand_slash ?? 0) >= 1;
  }

  static getSandSlashLevel(): number {
    return useGameStore.getState().save.upgrades.sand_slash ?? 0;
  }

  static isWarCryUnlocked(): boolean {
    return (useGameStore.getState().save.relicLevels.sun_strike ?? 0) >= 1;
  }

  static isSentinelShieldUnlocked(): boolean {
    return (useGameStore.getState().save.relicLevels.sentinel_shield ?? 0) >= 1;
  }

  static getWarCryDamage(): number {
    return Math.round(this.getSwordDamage() * 0.75);
  }

  static addGold(amount: number): void {
    const state = useGameStore.getState();
    state.updateMissionRuntime({ goldCollected: state.mission.goldCollected + amount });
  }

  static addKill(): void {
    const state = useGameStore.getState();
    state.updateMissionRuntime({ enemiesKilled: state.mission.enemiesKilled + 1 });
  }

  static addBossKill(enemyType: string): void {
    const state = useGameStore.getState();
    const bossesKilled = state.mission.bossesKilled;
    if (bossesKilled.includes(enemyType)) return;
    state.updateMissionRuntime({ bossesKilled: [...bossesKilled, enemyType] });
  }

  static endVictory(goldEarned: number, xpEarned: number): void {
    const { mission } = useGameStore.getState();
    useGameStore.getState().endMission({
      victory: true,
      goldEarned,
      xpEarned,
      enemiesKilled: mission.enemiesKilled,
      gateHpRemaining: mission.gateHp,
    });
  }

  static endDefeat(): void {
    const { mission } = useGameStore.getState();
    useGameStore.getState().endMission({
      victory: false,
      goldEarned: mission.goldCollected,
      xpEarned: 0,
      enemiesKilled: mission.enemiesKilled,
      gateHpRemaining: mission.gateHp,
    });
  }

  static getDamageMultiplier(): number {
    const save = useGameStore.getState().save;
    const missionMult = useGameStore.getState().mission.damageMultiplier;
    const campWar = (save.campUpgrades.war_camp ?? 0) * 0.05;
    return missionMult * (1 + campWar);
  }

  static getSwordDamage(): number {
    const save = useGameStore.getState().save;
    const upgradeLevel = save.upgrades.sword_damage ?? 1;
    return Math.round((10 + (upgradeLevel - 1) * 5 + getLevelDamageBonus(save.level)) * this.getDamageMultiplier());
  }

  static getPlayerMaxHp(): number {
    const save = useGameStore.getState().save;
    const upgradeLevel = save.upgrades.malik_hp ?? 1;
    return 100 + (upgradeLevel - 1) * 15 + getLevelHpBonus(save.level);
  }

  static getPlayerSpeed(): number {
    const level = useGameStore.getState().save.upgrades.malik_speed ?? 1;
    return 200 + (level - 1) * 15;
  }

  static getBlockReduction(): number {
    const save = useGameStore.getState().save;
    const blockLevel = save.upgrades.block_strength ?? 1;
    const relicLevel = save.relicLevels.sand_shield ?? 0;
    const base = 0.75 + (blockLevel - 1) * 0.03;
    const relic = relicLevel * 0.1;
    return Math.min(0.95, base + relic);
  }

  static getHealingWindRegen(): number {
    return (useGameStore.getState().save.relicLevels.healing_wind ?? 0) * 2;
  }

  static getEclipseDamageReduction(): number {
    const missionType = useGameStore.getState().mission.missionType;
    if (missionType !== 'boss') return 0;
    return (useGameStore.getState().save.relicLevels.eclipse_ward ?? 0) * 0.08;
  }

  static getGateMaxHp(): number {
    const save = useGameStore.getState().save;
    const level = save.upgrades.gate_hp ?? 1;
    const camp = (save.campUpgrades.gate_workshop ?? 0) * 40;
    const timber = (save.campUpgrades.palm_timbers ?? 0) * 25;
    return 500 + (level - 1) * 50 + camp + timber;
  }

  static getOasisRegenRate(): number {
    const save = useGameStore.getState().save;
    const base = 10;
    const camp = (save.campUpgrades.well_blessing ?? 0) * 3;
    const hero = getHero(useGameStore.getState().mission.heroId ?? '');
    const heroMult = hero?.supportHealMult ?? 1;
    return (base + camp) * heroMult;
  }

  static getNgPlusMultiplier(): number {
    return getNgPlusMultiplier(useGameStore.getState().save.ngPlusLevel ?? 0);
  }

  static getGoldCollected(): number {
    return useGameStore.getState().mission.goldCollected;
  }

  static spendMissionGold(amount: number): boolean {
    const state = useGameStore.getState();
    if (state.mission.goldCollected < amount) return false;
    state.updateMissionRuntime({ goldCollected: state.mission.goldCollected - amount });
    return true;
  }

  static getRepairRate(): number {
    const save = useGameStore.getState().save;
    const level = save.upgrades.repair_speed ?? 1;
    const mult = useGameStore.getState().mission.repairMultiplier;
    const hero = getHero(useGameStore.getState().mission.heroId ?? '');
    const heroMult = hero?.supportHealMult ?? 1;
    return (25 + (level - 1) * 10) * mult * getDefenseRepairMultiplier(save) * heroMult;
  }

  static getDiscountedBuildGoldCost(baseCost: number): number {
    const discount = getBuildGoldDiscount(useGameStore.getState().save);
    return Math.max(1, Math.round(baseCost * (1 - discount)));
  }

  static getTowerDamage(): number {
    const level = useGameStore.getState().save.upgrades.tower_damage ?? 1;
    return 15 + (level - 1) * 5;
  }

  static getSelectedBuild() {
    return getBuildDefinition(useGameStore.getState().save.selectedBuild) ?? getBuildDefinition('arrow_tower')!;
  }

  static syncHeroAbilityCooldown(pct: number): void {
    useGameStore.getState().updateMissionRuntime({ heroAbilityCooldown: pct });
  }

  static getActiveHeroId(): string | null {
    return useGameStore.getState().mission.heroId;
  }

  static usePrepBuildRules(): boolean {
    return useGameStore.getState().mission.usePrepBuildRules;
  }

  static getMissionWood(): number {
    return useGameStore.getState().mission.missionWood;
  }

  static getMissionIron(): number {
    return useGameStore.getState().mission.missionIron;
  }

  static spendMissionWood(amount: number): boolean {
    const state = useGameStore.getState();
    if (state.mission.missionWood < amount) return false;
    state.updateMissionRuntime({ missionWood: state.mission.missionWood - amount });
    return true;
  }

  static spendMissionIron(amount: number): boolean {
    const state = useGameStore.getState();
    if (state.mission.missionIron < amount) return false;
    state.updateMissionRuntime({ missionIron: state.mission.missionIron - amount });
    return true;
  }

  static refundMissionWood(amount: number): void {
    const state = useGameStore.getState();
    state.updateMissionRuntime({ missionWood: state.mission.missionWood + amount });
  }

  static refundMissionIron(amount: number): void {
    const state = useGameStore.getState();
    state.updateMissionRuntime({ missionIron: state.mission.missionIron + amount });
  }

  static recordBuildPlaced(buildId: string): void {
    const state = useGameStore.getState();
    if (buildId === 'arrow_tower' || buildId === 'iron_tower') {
      state.updateMissionRuntime({ towersBuilt: state.mission.towersBuilt + 1 });
    } else if (buildId === 'spike_trap') {
      state.updateMissionRuntime({ trapsBuilt: state.mission.trapsBuilt + 1 });
    }
  }

  static canPlaceBuildType(buildId: string): boolean {
    const m = useGameStore.getState().mission;
    if (!m.usePrepBuildRules) return true;
    if (buildId === 'arrow_tower' || buildId === 'iron_tower') {
      return m.towersBuilt < m.maxTowerBuilds;
    }
    if (buildId === 'spike_trap') {
      return m.trapsBuilt < m.maxTrapBuilds;
    }
    return true;
  }

  static isGateGuardActive(): boolean {
    return useGameStore.getState().mission.gateGuardActive;
  }

  static getBuildUnlockContext(): BuildUnlockContext {
    const save = useGameStore.getState().save;
    const mission = useGameStore.getState().mission;
    return {
      completedMissions: save.completedMissions,
      lionLevel: save.upgrades.lion_level ?? 0,
      lionDenCampLevel: save.campUpgrades.lion_den ?? 0,
      unlockedBlueprints: save.unlockedBlueprints,
      strictBlueprintsOnly: mission.usePrepBuildRules,
    };
  }

  static getSaveSnapshot() {
    return useGameStore.getState().save;
  }

  static spendSaveIron(amount: number): void {
    const save = useGameStore.getState().save;
    const updated = { ...save, iron: save.iron - amount };
    persistSave(updated);
    useGameStore.setState({ save: updated });
  }

  static refundSaveIron(amount: number): void {
    const save = useGameStore.getState().save;
    const updated = { ...save, iron: save.iron + amount };
    useGameStore.setState({ save: updated });
  }

  static spendSaveWood(amount: number): void {
    const save = useGameStore.getState().save;
    const updated = { ...save, wood: save.wood - amount };
    persistSave(updated);
    useGameStore.setState({ save: updated });
  }

  static isLionUnlocked(): boolean {
    return (useGameStore.getState().save.upgrades.lion_level ?? 0) >= 1;
  }

  static getLionLevel(): number {
    return useGameStore.getState().save.upgrades.lion_level ?? 0;
  }

  static getLionDamage(): number {
    const level = this.getLionLevel();
    return 8 + (level - 1) * 4;
  }

  static getLionMaxHp(): number {
    const level = this.getLionLevel();
    return 80 + (level - 1) * 20;
  }

  static getLionMode() {
    return useGameStore.getState().save.lionMode;
  }

  static getLionRespawnMs(): number {
    const den = useGameStore.getState().save.campUpgrades.lion_den ?? 0;
    const level = this.getLionLevel();
    return Math.max(6000, 15000 - den * 2000 - level * 500);
  }

  static getLionRoarCooldownMs(): number {
    const den = useGameStore.getState().save.campUpgrades.lion_den ?? 0;
    return Math.max(6000, 12000 - den * 1500);
  }

  static getShopDiscount(): number {
    return (useGameStore.getState().save.campUpgrades.merchant_tents ?? 0) * 0.1;
  }
}
