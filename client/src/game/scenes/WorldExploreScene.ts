import Phaser from 'phaser';
import {
  getOverworldRegion,
  getActiveOverworldPOIs,
  getActiveOverworldWalls,
  getActiveOverworldPatrols,
  getOverworldPOIInteractHint,
  isOverworldPOIUnlocked,
  isOverworldCellExplored,
  getOverworldNpcDialogue,
  getMissionById,
  OVERWORLD_CELL_SIZE,
  type OverworldPOI,
  type OverworldPatrol,
} from '@malik/shared';
import { OverworldPlayer } from '../entities/OverworldPlayer';
import { OverworldPatrolSprite } from '../entities/OverworldPatrolSprite';
import { OverworldBridge } from '../systems/OverworldBridge';
import { OverworldInput } from '../systems/OverworldInput';
import { SoundManager } from '../systems/SoundManager';
import { useGameStore } from '@/store/gameStore';

export class WorldExploreScene extends Phaser.Scene {
  private player!: OverworldPlayer;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private patrolGroup!: Phaser.Physics.Arcade.Group;
  private poiMarkers = new Map<string, Phaser.GameObjects.Container>();
  private patrolSprites = new Map<string, OverworldPatrolSprite>();
  private fogGraphics!: Phaser.GameObjects.Graphics;
  private nearestPoi: OverworldPOI | null = null;
  private regionId = 'nahran-outskirts';
  private patrolTouchCooldown = new Map<string, number>();
  private regionWidth = 2200;
  private regionHeight = 1700;

  constructor() {
    super({ key: 'WorldExploreScene' });
  }

  create(): void {
    this.regionId = (this.registry.get('regionId') as string) ?? 'nahran-outskirts';
    const region = getOverworldRegion(this.regionId);
    this.regionWidth = region.width;
    this.regionHeight = region.height;

    OverworldBridge.ensureExploredSeed(this.regionId);

    const save = useGameStore.getState().save;
    const pos = save.overworldPosition.regionId === this.regionId
      ? save.overworldPosition
      : region.defaultSpawn;

    this.buildTerrain(region);
    this.buildRoads();
    this.buildLandmarks(region);

    this.fogGraphics = this.add.graphics().setDepth(40);

    this.walls = this.physics.add.staticGroup();
    for (const wall of getActiveOverworldWalls(region, save)) {
      const block = this.add.rectangle(wall.x + wall.w / 2, wall.y + wall.h / 2, wall.w, wall.h, 0x3d2817, 0.85);
      this.walls.add(block);
    }

    this.player = new OverworldPlayer(this, pos.x, pos.y);

    this.patrolGroup = this.physics.add.group();
    this.refreshPatrols();
    this.refreshPOIMarkers();
    this.rebuildFog();

    OverworldBridge.exploreCells(this.regionId, pos.x, pos.y);
    OverworldBridge.revealPOIAreas(this.regionId, getActiveOverworldPOIs(region, save));

    this.cameras.main.setBounds(0, 0, region.width, region.height);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.setZoom(1);

    this.events.on('overworld-refresh', this.onOverworldRefresh, this);
    this.events.on('overworld-teleport', (x: number, y: number) => this.teleportPlayer(x, y));
  }

  teleportPlayer(x: number, y: number): void {
    if (!this.player) return;
    this.player.setPosition(x, y);
    OverworldBridge.exploreCells(this.regionId, x, y);
    OverworldBridge.syncPosition(this.regionId, x, y, true);
    this.rebuildFog();
    this.refreshPOIMarkers();
  }

  private isMovementBlocked(): boolean {
    const state = useGameStore.getState();
    return Boolean(
      state.overworldCampOpen
      || state.overworldDialog
      || state.overworldMissionOffer
      || state.pendingActBanner
      || state.overworldMapOpen,
    );
  }

  private isPositionBlocked(x: number, y: number): boolean {
    const save = useGameStore.getState().save;
    const walls = getActiveOverworldWalls(getOverworldRegion(this.regionId), save);
    const r = 12;
    for (const wall of walls) {
      if (x + r > wall.x && x - r < wall.x + wall.w && y + r > wall.y && y - r < wall.y + wall.h) {
        return true;
      }
    }
    return false;
  }

  update(time: number, delta: number): void {
    if (!this.player) return;

    if (OverworldInput.consumeMapToggle()) {
      useGameStore.getState().toggleOverworldMap();
    }

    if (!this.isMovementBlocked()) {
      this.player.updateMovement(delta, this.regionWidth, this.regionHeight, (x, y) => this.isPositionBlocked(x, y));
    }

    OverworldBridge.syncPosition(this.regionId, this.player.x, this.player.y);

    const explored = OverworldBridge.exploreCells(this.regionId, this.player.x, this.player.y);
    if (explored.length > 0) {
      this.rebuildFog();
      this.refreshPOIMarkers();
    }

    for (const sprite of this.patrolSprites.values()) {
      sprite.updatePatrol(time, delta);
    }

    this.checkPatrolTouches(time);
    this.updateNearestPOI();

    if (this.player.wantsInteract() && this.nearestPoi) {
      this.handleInteract(this.nearestPoi);
    }
  }

  private onOverworldRefresh(): void {
    this.refreshPOIMarkers();
    this.refreshPatrols();
    this.rebuildFog();
    const region = getOverworldRegion(this.regionId);
    const save = useGameStore.getState().save;
    OverworldBridge.revealPOIAreas(this.regionId, getActiveOverworldPOIs(region, save));

    if (this.walls) {
      this.walls.clear(true, true);
      for (const wall of getActiveOverworldWalls(region, save)) {
        const block = this.add.rectangle(wall.x + wall.w / 2, wall.y + wall.h / 2, wall.w, wall.h, 0x3d2817, 0.85);
        this.walls.add(block);
      }
    }
  }

  private checkPatrolTouches(time: number): void {
    if (useGameStore.getState().overworldMissionOffer) return;

    for (const [id, sprite] of this.patrolSprites) {
      const patrol = sprite.getData('patrol') as OverworldPatrol;
      const lastTouch = this.patrolTouchCooldown.get(id) ?? 0;
      if (time - lastTouch < 3000) continue;

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
      if (dist <= patrol.touchRadius) {
        this.patrolTouchCooldown.set(id, time);
        SoundManager.play('click');
        OverworldBridge.offerPatrolAmbush(patrol, this.player.x, this.player.y);
        break;
      }
    }
  }

  private isPOIMarkerVisible(poi: OverworldPOI, save: ReturnType<typeof useGameStore.getState>['save']): boolean {
    if (save.visitedOverworldPOIs.includes(poi.id)) return true;
    return isOverworldCellExplored(this.regionId, poi.x, poi.y, save.exploredOverworldCells);
  }

  private rebuildFog(): void {
    const save = useGameStore.getState().save;
    const explored = new Set(save.exploredOverworldCells);
    const cols = Math.ceil(this.regionWidth / OVERWORLD_CELL_SIZE);
    const rows = Math.ceil(this.regionHeight / OVERWORLD_CELL_SIZE);

    this.fogGraphics.clear();
    this.fogGraphics.fillStyle(0x0a0812, 0.72);

    for (let cx = 0; cx < cols; cx += 1) {
      for (let cy = 0; cy < rows; cy += 1) {
        const key = `${this.regionId}:${cx},${cy}`;
        if (explored.has(key)) continue;
        this.fogGraphics.fillRect(cx * OVERWORLD_CELL_SIZE, cy * OVERWORLD_CELL_SIZE, OVERWORLD_CELL_SIZE, OVERWORLD_CELL_SIZE);
      }
    }
  }

  private refreshPatrols(): void {
    const save = useGameStore.getState().save;
    const region = getOverworldRegion(this.regionId);
    const patrols = getActiveOverworldPatrols(region, save);

    for (const [id, sprite] of this.patrolSprites) {
      if (!patrols.find((p) => p.id === id)) {
        sprite.destroy();
        this.patrolSprites.delete(id);
      }
    }

    for (const patrol of patrols) {
      if (this.patrolSprites.has(patrol.id)) continue;
      const sprite = new OverworldPatrolSprite(this, patrol);
      this.patrolGroup.add(sprite);
      this.patrolSprites.set(patrol.id, sprite);
    }
  }

  private updateNearestPOI(): void {
    const save = useGameStore.getState().save;
    const region = getOverworldRegion(this.regionId);
    const pois = getActiveOverworldPOIs(region, save).filter((p) => this.isPOIMarkerVisible(p, save));

    let nearest: OverworldPOI | null = null;
    let nearestDist = Infinity;

    for (const poi of pois) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, poi.x, poi.y);
      if (d < poi.radius && d < nearestDist) {
        nearestDist = d;
        nearest = poi;
      }
    }

    if (nearest?.id !== this.nearestPoi?.id) {
      this.nearestPoi = nearest;
      if (nearest) {
        OverworldBridge.markPOIVisited(nearest.id);
        const hint = getOverworldPOIInteractHint(nearest, save);
        OverworldBridge.setInteractPrompt(hint ? `[E] ${hint}` : null, nearest);
      } else {
        OverworldBridge.setInteractPrompt(null, null);
      }
    }
  }

  private handleInteract(poi: OverworldPOI): void {
    const save = useGameStore.getState().save;
    if (!isOverworldPOIUnlocked(poi, save)) {
      SoundManager.play('click');
      return;
    }

    SoundManager.play('click');
    OverworldBridge.markPOIVisited(poi.id);

    switch (poi.kind) {
      case 'camp_hub':
        OverworldBridge.openCampHub();
        break;
      case 'npc': {
        if (poi.npcId === 'blacksmith') {
          const recruited = useGameStore.getState().save.recruitedHeroes.includes('aisha');
          if (!recruited) {
            useGameStore.setState({ overworldRecruitOffer: { heroId: 'aisha' } });
            break;
          }
        }
        const dialog = poi.npcId ? getOverworldNpcDialogue(poi.npcId) : undefined;
        if (dialog) OverworldBridge.openNpcDialog(dialog.id, dialog.lines, dialog.name);
        break;
      }
      case 'mission':
      case 'ambush':
      case 'locked_gate':
        if (poi.missionId) {
          const mission = getMissionById(poi.missionId);
          OverworldBridge.offerMission(
            poi.missionId,
            mission?.name ?? poi.label,
            mission?.storyBrief ?? mission?.objective ?? '',
            this.player.x,
            this.player.y,
          );
        }
        break;
      case 'chest':
      case 'cart': {
        const granted = OverworldBridge.grantChest(poi.id, poi.chestGold ?? 0, poi.chestIron ?? 0);
        const blueprintNew =
          poi.kind === 'cart' ? useGameStore.getState().unlockBlueprint('spike_trap') : false;
        if (granted || blueprintNew) {
          SoundManager.play('gold');
          if (blueprintNew) this.showFloatText('Spike Trap blueprint recovered!');
          else if (granted) this.showFloatText(`+${poi.chestGold ?? 0} gold`);
        }
        break;
      }
      case 'resource':
        if (poi.resourceLocationId) {
          useGameStore.getState().collectResource(poi.resourceLocationId);
          SoundManager.play('gold');
        }
        break;
      case 'event':
        if (OverworldBridge.completeEvent(poi.id, poi.chestGold ?? 0, poi.eventLoreId)) {
          SoundManager.play('gold');
          this.showFloatText(`+${poi.chestGold ?? 0} gold · lore found`);
        }
        break;
    }
  }

  private showFloatText(text: string): void {
    const label = this.add
      .text(this.player.x, this.player.y - 40, text, {
        fontSize: '14px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({ targets: label, y: label.y - 30, alpha: 0, duration: 1200, onComplete: () => label.destroy() });
  }

  private refreshPOIMarkers(): void {
    const save = useGameStore.getState().save;
    const region = getOverworldRegion(this.regionId);
    const pois = getActiveOverworldPOIs(region, save).filter((p) => this.isPOIMarkerVisible(p, save));

    for (const [id, marker] of this.poiMarkers) {
      if (!pois.find((p) => p.id === id)) {
        marker.destroy();
        this.poiMarkers.delete(id);
      }
    }

    for (const poi of pois) {
      if (this.poiMarkers.has(poi.id)) continue;
      const marker = this.createPOIMarker(poi, save);
      this.poiMarkers.set(poi.id, marker);
    }
  }

  private createPOIMarker(poi: OverworldPOI, save: ReturnType<typeof useGameStore.getState>['save']): Phaser.GameObjects.Container {
    const container = this.add.container(poi.x, poi.y).setDepth(8);
    const unlocked = isOverworldPOIUnlocked(poi, save);
    const visited = save.visitedOverworldPOIs.includes(poi.id);

    let color = 0xd4a843;
    if (poi.kind === 'mission' || poi.kind === 'ambush') color = 0xff6644;
    if (poi.kind === 'npc') color = 0x88ccff;
    if (poi.kind === 'locked_gate') color = unlocked ? 0xffaa44 : 0x666666;
    if (poi.kind === 'chest' || poi.kind === 'cart') color = 0xaa88ff;
    if (poi.kind === 'event') color = 0x66ccaa;

    const base = this.add.circle(0, 0, 18, color, visited ? 0.35 : 0.55);
    const ring = this.add.circle(0, 0, 24, color, 0).setStrokeStyle(2, color, 0.6);
    container.add([base, ring]);

    const label = this.add
      .text(0, -36, poi.label, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5);
    container.add(label);

    if (poi.kind === 'mission' && poi.missionId && !save.completedMissions.includes(poi.missionId)) {
      const icon = this.add.text(0, 0, '⚔', { fontSize: '16px' }).setOrigin(0.5);
      container.add(icon);
    }

    return container;
  }

  private buildTerrain(region: { width: number; height: number }): void {
    this.add.rectangle(region.width / 2, region.height / 2, region.width, region.height, 0xc4a35a);
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(40, region.width - 40);
      const y = Phaser.Math.Between(40, region.height - 40);
      this.add.ellipse(x, y, Phaser.Math.Between(30, 90), Phaser.Math.Between(20, 50), 0xb8956a, 0.25);
    }
  }

  private buildRoads(): void {
    const roadColor = 0xd4b86a;
    const g = this.add.graphics();
    g.fillStyle(roadColor, 0.85);
    g.fillRoundedRect(440, 1180, 720, 48, 8);
    g.fillRoundedRect(700, 520, 48, 720, 8);
    g.fillRoundedRect(900, 480, 400, 48, 8);
    g.fillRoundedRect(1500, 880, 48, 200, 8);
    g.fillRoundedRect(1040, 180, 48, 360, 8);
    g.setDepth(1);
  }

  private buildLandmarks(region: { width: number; height: number }): void {
    this.add.image(480, 1220, 'dune_mid').setOrigin(0.5, 1).setTint(0x8b6914).setScale(1.2);
    this.add.image(1100, 500, 'palm_tree').setOrigin(0.5, 1).setScale(1.4).setDepth(3);
    this.add.image(1100, 190, 'dune_far').setOrigin(0.5, 1).setTint(0x706050).setScale(1.5).setDepth(2);
    this.add.rectangle(920, 1140, 80, 60, 0x696969, 0.9).setDepth(4);
    this.add.text(920, 1100, 'GATE', { fontSize: '10px', color: '#d4a843' }).setOrigin(0.5).setDepth(5);
    this.add.text(region.width / 2, 36, 'Nahran Outskirts', {
      fontSize: '22px',
      color: '#d4a843',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  shutdown(): void {
    this.events.off('overworld-refresh', this.onOverworldRefresh, this);
    OverworldBridge.setInteractPrompt(null, null);
    OverworldBridge.flushSave();
  }
}
