import Phaser from 'phaser';
import { isTowerBuild, isTrapBuild } from '@malik/shared';
import { isBuildUnlocked } from '@malik/shared';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import { ArrowTower } from './ArrowTower';
import { SpikeTrap } from './SpikeTrap';
import { Barricade } from './Barricade';
import { RepairStation } from './RepairStation';
import { IronTower } from './IronTower';
import { LionDen } from './LionDen';
import { SpecialTower } from './SpecialTower';
import { SpecialTrap } from './SpecialTrap';
import type { Player } from './Player';

export type BuiltStructure =
  | ArrowTower
  | SpikeTrap
  | Barricade
  | RepairStation
  | IronTower
  | LionDen
  | SpecialTower
  | SpecialTrap;

export class BuildSocket extends Phaser.GameObjects.Container {
  private built = false;
  private hintText?: Phaser.GameObjects.Text;
  private platform: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.platform = scene.add.image(0, 0, 'build_socket').setOrigin(0.5, 1);
    this.add(this.platform);

    scene.add.existing(this);
    this.setDepth(4);
  }

  isBuilt(): boolean {
    return this.built;
  }

  updateHint(player: Player): void {
    if (this.built) return;

    const build = MissionBridge.getSelectedBuild();
    const ctx = MissionBridge.getBuildUnlockContext();
    const locked = !isBuildUnlocked(build.id as Parameters<typeof isBuildUnlocked>[0], ctx);
    const slotFull = !MissionBridge.canPlaceBuildType(build.id);

    if (!this.hintText) {
      this.hintText = this.scene.add
        .text(0, -70, '', {
          fontSize: '11px',
          color: '#d4a843',
          fontFamily: 'Georgia, serif',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5)
        .setVisible(false);
      this.add(this.hintText);
    }

    const near = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 90;
    this.hintText.setVisible(near);

    if (locked) {
      this.hintText.setText(`[B] ${build.name} (locked)`);
      this.hintText.setColor('#ff6666');
      return;
    }

    if (slotFull) {
      const label = isTowerBuild(build.id) ? 'tower slots full' : isTrapBuild(build.id) ? 'trap slots full' : 'slots full';
      this.hintText.setText(`[B] ${build.name} (${label})`);
      this.hintText.setColor('#ff6666');
      return;
    }

    const goldCost = MissionBridge.getDiscountedBuildGoldCost(build.goldCost);
    const parts = [`${goldCost}g`];
    if (build.woodCost > 0) parts.push(`${build.woodCost} wood`);
    if (build.ironCost > 0) parts.push(`${build.ironCost} iron`);
    this.hintText.setText(`[B] ${build.name} (${parts.join(' + ')})`);

    const canAfford = this.canAffordBuild(goldCost, build.woodCost, build.ironCost);
    this.hintText.setColor(canAfford ? '#d4a843' : '#ff6666');
  }

  tryBuild(): BuiltStructure | null {
    if (this.built) return null;

    const build = MissionBridge.getSelectedBuild();
    const ctx = MissionBridge.getBuildUnlockContext();
    if (!isBuildUnlocked(build.id as Parameters<typeof isBuildUnlocked>[0], ctx)) return null;
    if (!MissionBridge.canPlaceBuildType(build.id)) return null;

    const goldCost = MissionBridge.getDiscountedBuildGoldCost(build.goldCost);
    if (!MissionBridge.spendMissionGold(goldCost)) return null;

    const useMissionSupplies = MissionBridge.usePrepBuildRules();
    if (build.ironCost > 0) {
      const ok = useMissionSupplies
        ? MissionBridge.spendMissionIron(build.ironCost)
        : this.spendSaveIron(build.ironCost);
      if (!ok) {
        MissionBridge.addGold(goldCost);
        return null;
      }
    }

    if (build.woodCost > 0) {
      const ok = useMissionSupplies
        ? MissionBridge.spendMissionWood(build.woodCost)
        : this.spendSaveWood(build.woodCost);
      if (!ok) {
        MissionBridge.addGold(goldCost);
        if (build.ironCost > 0) {
          if (useMissionSupplies) MissionBridge.refundMissionIron(build.ironCost);
          else MissionBridge.refundSaveIron(build.ironCost);
        }
        return null;
      }
    }

    this.built = true;
    this.platform.setVisible(false);
    this.hintText?.destroy();
    SoundManager.play('build');
    MissionBridge.recordBuildPlaced(build.id);

    switch (build.id) {
      case 'fire_tower':
      case 'water_tower':
      case 'relic_tower':
      case 'ballista':
        return new SpecialTower(this.scene, this.x, this.y, build.id);
      case 'spike_trap':
        return new SpikeTrap(this.scene, this.x, this.y);
      case 'fire_pot':
      case 'water_slow_trap':
      case 'poison_trap':
      case 'sand_pit':
      case 'light_trap':
      case 'rolling_stone':
        return new SpecialTrap(this.scene, this.x, this.y, build.id);
      case 'barricade':
      case 'reinforced_wall':
      case 'stone_wall':
      case 'spiked_wall':
      case 'relic_wall':
        return new Barricade(this.scene, this.x, this.y, build.id);
      case 'repair_station':
        return new RepairStation(this.scene, this.x, this.y);
      case 'iron_tower':
        return new IronTower(this.scene, this.x, this.y);
      case 'lion_den':
        return new LionDen(this.scene, this.x, this.y);
      default:
        return new ArrowTower(this.scene, this.x, this.y);
    }
  }

  private canAffordBuild(goldCost: number, woodCost: number, ironCost: number): boolean {
    if (MissionBridge.getGoldCollected() < goldCost) return false;
    if (MissionBridge.usePrepBuildRules()) {
      if (woodCost > 0 && MissionBridge.getMissionWood() < woodCost) return false;
      if (ironCost > 0 && MissionBridge.getMissionIron() < ironCost) return false;
      return true;
    }
    const save = MissionBridge.getSaveSnapshot();
    if (ironCost > 0 && (save.iron ?? 0) < ironCost) return false;
    if (woodCost > 0 && (save.wood ?? 0) < woodCost) return false;
    return true;
  }

  private spendSaveIron(amount: number): boolean {
    const save = MissionBridge.getSaveSnapshot();
    if ((save.iron ?? 0) < amount) return false;
    MissionBridge.spendSaveIron(amount);
    return true;
  }

  private spendSaveWood(amount: number): boolean {
    const save = MissionBridge.getSaveSnapshot();
    if ((save.wood ?? 0) < amount) return false;
    MissionBridge.spendSaveWood(amount);
    return true;
  }
}
