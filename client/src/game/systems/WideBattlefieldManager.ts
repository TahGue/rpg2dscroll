import Phaser from 'phaser';
import type { BrokenDefenseDef, FieldResourceDef, WideBattlefieldConfig } from '@malik/shared';
import { MissionBridge } from './MissionBridge';
import { SoundManager } from './SoundManager';
import type { Player } from '../entities/Player';
import type { BuiltStructure } from '../entities/BuildSocket';
import { ArrowTower } from '../entities/ArrowTower';
import { SpikeTrap } from '../entities/SpikeTrap';
import { Barricade } from '../entities/Barricade';
import { useGameStore } from '@/store/gameStore';

const INTERACT_RADIUS = 95;

interface FieldResourceNode {
  def: FieldResourceDef;
  x: number;
  marker: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Image;
  collected: boolean;
}

interface BrokenSiteNode {
  def: BrokenDefenseDef;
  x: number;
  marker: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Image;
  repaired: boolean;
}

export class WideBattlefieldManager {
  private resources: FieldResourceNode[] = [];
  private brokenSites: BrokenSiteNode[] = [];
  private interactHint: Phaser.GameObjects.Text | null = null;
  private pendingAction: (() => void) | null = null;

  constructor(
    private scene: Phaser.Scene,
    private config: WideBattlefieldConfig,
    private worldWidth: number,
    private groundY: number,
    private onStructureBuilt: (built: BuiltStructure) => void,
    private registerBarricade: (barricade: Barricade) => void,
    private addTower: (tower: ArrowTower | SpikeTrap) => void,
  ) {}

  create(): void {
    this.drawBattlefieldGuide();
    for (const scout of this.config.scoutMarkers) {
      const x = this.worldWidth * scout.xRatio;
      this.scene.add
        .text(x, this.groundY - 105, scout.label, {
          fontSize: '11px',
          color: scout.side === 'left' ? '#ffaa66' : '#88ccff',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        })
        .setOrigin(0.5)
        .setAlpha(0.75)
        .setDepth(2);
    }

    for (const res of this.config.fieldResources) {
      const x = this.worldWidth * res.xRatio;
      const sprite = this.scene.add
        .image(x, this.groundY - 8, 'dune_mid')
        .setOrigin(0.5, 1)
        .setScale(0.45, 0.35)
        .setTint(res.iron ? 0x8899aa : res.gold ? 0xd4a843 : 0x8b6914)
        .setDepth(3);
      const marker = this.scene.add
        .text(x, this.groundY - 52, res.label, {
          fontSize: '10px',
          color: '#d4a843',
          fontFamily: 'Georgia, serif',
        })
        .setOrigin(0.5)
        .setDepth(3);
      this.resources.push({ def: res, x, marker, sprite, collected: false });
    }

    for (const site of this.config.brokenDefenses) {
      const x = this.worldWidth * site.xRatio;
      const sprite = this.scene.add
        .image(x, this.groundY - 4, site.buildType === 'barricade' ? 'barricade' : 'tower_base')
        .setOrigin(0.5, 1)
        .setScale(0.9)
        .setTint(0x666666)
        .setAlpha(0.65)
        .setDepth(3);
      const marker = this.scene.add
        .text(x, this.groundY - 62, site.label, {
          fontSize: '10px',
          color: '#cccccc',
          fontFamily: 'Georgia, serif',
        })
        .setOrigin(0.5)
        .setDepth(3);
      this.brokenSites.push({ def: site, x, marker, sprite, repaired: false });
    }

    this.interactHint = this.scene.add
      .text(0, 0, '', {
        fontSize: '12px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
        backgroundColor: '#000000bb',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(250)
      .setVisible(false);
  }

  update(player: Player, cam: Phaser.Cameras.Scene2D.Camera): void {
    if (!this.isPrepPhase()) {
      this.hideHint();
      return;
    }

    this.pendingAction = null;
    let hint = '';

    for (const node of this.resources) {
      if (node.collected) continue;
      if (Phaser.Math.Distance.Between(player.x, player.y, node.x, this.groundY) > INTERACT_RADIUS) continue;
      const parts: string[] = [];
      if (node.def.wood) parts.push(`${node.def.wood} wood`);
      if (node.def.iron) parts.push(`${node.def.iron} iron`);
      if (node.def.gold) parts.push(`${node.def.gold} gold`);
      hint = `[E] Gather ${node.def.label} (+${parts.join(', ')})`;
      this.pendingAction = () => this.collectResource(node);
      break;
    }

    if (!hint) {
      for (const site of this.brokenSites) {
        if (site.repaired) continue;
        if (Phaser.Math.Distance.Between(player.x, player.y, site.x, this.groundY) > INTERACT_RADIUS) continue;
        const cost = [
          site.def.repairWood ? `${site.def.repairWood}w` : '',
          site.def.repairIron ? `${site.def.repairIron}i` : '',
        ]
          .filter(Boolean)
          .join(' + ');
        hint = `[E] Repair ${site.def.label} (${cost})`;
        this.pendingAction = () => this.repairSite(site);
        break;
      }
    }

    if (hint && this.interactHint) {
      this.interactHint.setText(hint);
      this.interactHint.setPosition(cam.width / 2, cam.height - 120);
      this.interactHint.setVisible(true);
    } else {
      this.hideHint();
    }
  }

  tryInteract(): boolean {
    if (!this.pendingAction) return false;
    this.pendingAction();
    this.pendingAction = null;
    return true;
  }

  getCommanderBrief(): string {
    return this.config.commanderBrief;
  }

  private isPrepPhase(): boolean {
    const m = useGameStore.getState().mission;
    return m.awaitingWaveStart || m.betweenWaves || (m.currentWave === 0 && m.enemiesRemaining === 0);
  }

  private hideHint(): void {
    this.interactHint?.setVisible(false);
    this.pendingAction = null;
  }

  private collectResource(node: FieldResourceNode): void {
    if (node.collected) return;
    const { def } = node;
    if (def.wood) MissionBridge.addMissionWood(def.wood);
    if (def.iron) MissionBridge.addMissionIron(def.iron);
    if (def.gold) MissionBridge.addGold(def.gold);
    node.collected = true;
    SoundManager.play('gold');
    this.scene.tweens.add({
      targets: [node.sprite, node.marker],
      alpha: 0,
      y: '-=20',
      duration: 500,
      onComplete: () => {
        node.sprite.destroy();
        node.marker.destroy();
      },
    });
  }

  private repairSite(site: BrokenSiteNode): void {
    if (site.repaired) return;
    const { def } = site;
    if (def.repairWood && MissionBridge.getMissionWood() < def.repairWood) return;
    if (def.repairIron && MissionBridge.getMissionIron() < def.repairIron) return;
    if (def.repairWood && !MissionBridge.spendMissionWood(def.repairWood)) return;
    if (def.repairIron && !MissionBridge.spendMissionIron(def.repairIron)) return;

    if (MissionBridge.usePrepBuildRules()) {
      if (def.buildType === 'arrow_tower' && !MissionBridge.canPlaceBuildType('arrow_tower')) return;
      if (def.buildType === 'spike_trap' && !MissionBridge.canPlaceBuildType('spike_trap')) return;
    }

    site.repaired = true;
    site.sprite.destroy();
    site.marker.destroy();
    SoundManager.play('build');

    if (def.buildType === 'barricade') {
      const barricade = new Barricade(this.scene, site.x, this.groundY);
      this.registerBarricade(barricade);
      this.onStructureBuilt(barricade);
    } else if (def.buildType === 'spike_trap') {
      const trap = new SpikeTrap(this.scene, site.x, this.groundY);
      this.addTower(trap);
      MissionBridge.recordBuildPlaced('spike_trap');
      this.onStructureBuilt(trap);
    } else {
      const tower = new ArrowTower(this.scene, site.x, this.groundY);
      this.addTower(tower);
      MissionBridge.recordBuildPlaced('arrow_tower');
      this.onStructureBuilt(tower);
    }
  }

  private drawBattlefieldGuide(): void {
    const gateX = this.worldWidth * 0.5;
    const leftLabel = this.config.leftZoneLabel ?? 'Left Road';
    const rightLabel = this.config.rightZoneLabel ?? 'Right Road';

    for (let x = 80; x < gateX - 120; x += 120) {
      this.scene.add
        .rectangle(x, this.groundY - 4, 80, 6, 0x8b7355, 0.35)
        .setOrigin(0.5, 0.5)
        .setDepth(1);
    }
    for (let x = gateX + 120; x < this.worldWidth - 80; x += 120) {
      this.scene.add
        .rectangle(x, this.groundY - 4, 80, 6, 0x8b7355, 0.35)
        .setOrigin(0.5, 0.5)
        .setDepth(1);
    }

    this.scene.add
      .rectangle(gateX, this.groundY - 90, 4, 70, 0xd4a843, 0.25)
      .setDepth(1);

    this.scene.add
      .text(this.worldWidth * 0.12, this.groundY - 130, `← ${leftLabel}`, {
        fontSize: '12px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setAlpha(0.55)
      .setDepth(2);

    this.scene.add
      .text(this.worldWidth * 0.88, this.groundY - 130, `${rightLabel} →`, {
        fontSize: '12px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setAlpha(0.55)
      .setDepth(2);

    this.scene.add
      .text(gateX, this.groundY - 145, 'CITY GATE', {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setAlpha(0.65)
      .setDepth(2);

    this.scene.add
      .text(gateX, this.groundY - 125, '🔔 War Bell — sound horn when ready', {
        fontSize: '10px',
        color: '#ffcc88',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setAlpha(0.7)
      .setDepth(2);
  }
}
