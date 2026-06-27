import Phaser from 'phaser';
import { getMissionById, getDefenseLayout } from '@malik/shared';
import type { DefenseLayout } from '@malik/shared';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Player } from '../entities/Player';
import { Caravan } from '../entities/Caravan';
import { Gate } from '../entities/Gate';
import type { DefenseTarget } from '../entities/DefenseTarget';
import { Enemy } from '../entities/Enemy';
import { BuildSocket, type BuiltStructure } from '../entities/BuildSocket';
import { ArrowTower } from '../entities/ArrowTower';
import { SpikeTrap } from '../entities/SpikeTrap';
import { Barricade } from '../entities/Barricade';
import { RepairStation } from '../entities/RepairStation';
import { IronTower } from '../entities/IronTower';
import { LionDen } from '../entities/LionDen';
import { Lion } from '../entities/Lion';
import { GateGuard } from '../entities/GateGuard';
import { WaveManager } from '../systems/WaveManager';
import { MissionControlBridge } from '../systems/MissionControlBridge';
import { HeroAbilitySystem } from '../systems/HeroAbilitySystem';
import { HazardManager } from '../systems/HazardManager';
import { EclipseOverlay } from '../systems/EclipseOverlay';
import { MissionBridge } from '../systems/MissionBridge';
import { MusicManager } from '../systems/MusicManager';
import { SoundManager } from '../systems/SoundManager';
import { InputBridge } from '../systems/InputBridge';
import { bindKey, getKeyBindings } from '../systems/KeyBindingManager';
import { buildBiomeBackground, getBiomeForMission, updateBiomeParallax } from '../utils/biomeBackground';
import { useGameStore } from '@/store/gameStore';

export class MissionScene extends Phaser.Scene {
  private player!: Player;
  private gate: Gate | null = null;
  private caravan: Caravan | null = null;
  private isAmbush = false;
  private isShrine = false;
  private isCaravan = false;
  private isSurvive = false;
  private isOasis = false;
  private surviveDurationMs = 0;
  private caravanExitX = 0;
  private wavesCleared = false;
  private pendingVictory: { goldEarned: number; xpEarned: number } | null = null;
  private rightSpawnX = 0;
  private buildSockets: BuildSocket[] = [];
  private towers: (ArrowTower | SpikeTrap | IronTower)[] = [];
  private barricades: Barricade[] = [];
  private repairStations: RepairStation[] = [];
  private lion: Lion | null = null;
  private gateGuard: GateGuard | null = null;
  private heroAbilities: HeroAbilitySystem | null = null;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.GameObjects.Group;
  private waveManager!: WaveManager;
  private hazardManager: HazardManager | null = null;
  private eclipseOverlay: EclipseOverlay | null = null;
  private defenseLayout!: DefenseLayout;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private repairKey?: Phaser.Input.Keyboard.Key;
  private buildKey?: Phaser.Input.Keyboard.Key;
  private cycleBuildKey?: Phaser.Input.Keyboard.Key;
  private roarKey?: Phaser.Input.Keyboard.Key;

  private worldWidth = 2400;
  private groundY = GAME_HEIGHT - 80;
  private spawnX = 120;
  private gateX = 0;
  private socketX = 0;
  private missionEnded = false;
  private groundTexture = 'ground';
  private gateTexture = 'gate';
  private gateLabel = 'CAMP GATE';
  private repairing = false;
  private elapsedMs = 0;
  private lastBossPhase = -1;

  constructor() {
    super({ key: 'MissionScene' });
  }

  create(): void {
    const missionId = this.registry.get('missionId') as string;
    const mission = getMissionById(missionId);
    this.defenseLayout = getDefenseLayout(missionId, mission?.type);

    this.worldWidth = this.defenseLayout.worldWidth;
    this.spawnX = this.defenseLayout.spawnX;
    this.gateX = this.worldWidth * this.defenseLayout.gateXRatio;
    this.socketX = this.worldWidth * this.defenseLayout.socketXRatio;

    const biome = mission?.biome ?? getBiomeForMission(missionId);

    const biomeData = buildBiomeBackground(this, biome, this.worldWidth, this.groundY, missionId);
    this.groundTexture = biomeData.groundTexture;
    this.gateLabel = this.defenseLayout.gateLabel ?? biomeData.gateLabel;
    this.gateTexture = biome === 'oasis' ? 'gate_oasis' : 'gate';
    this.isAmbush = mission?.type === 'ambush';
    this.isShrine = mission?.type === 'shrine';
    this.isCaravan = mission?.type === 'caravan';
    this.isSurvive = mission?.type === 'survive';
    this.isOasis = mission?.type === 'oasis';
    this.surviveDurationMs = mission?.surviveDurationMs ?? 0;

    if (missionId === 'mission-shadow-emir') MusicManager.startFinale();
    else if (missionId === 'mission-black-eclipse' || missionId === 'mission-broken-watchtower') {
      MusicManager.startBoss();
    }

    if (this.isCaravan) {
      this.caravanExitX = this.worldWidth * this.defenseLayout.gateXRatio;
    }

    if (this.isShrine) {
      this.gateX = this.worldWidth * this.defenseLayout.gateXRatio;
      this.spawnX = 120;
      this.rightSpawnX = this.worldWidth - 120;
      this.gateLabel = this.defenseLayout.gateLabel ?? 'SACRED SHRINE';
      this.gateTexture = 'shrine';
    }

    this.createGround();
    if (this.isCaravan) {
      this.createCaravan();
      this.createBuildSockets();
      this.showCaravanRoute();
    } else if (!this.isAmbush) {
      this.createBuildSockets();
      this.createGate();
      if (this.defenseLayout.eclipseDarkness) {
        this.eclipseOverlay = new EclipseOverlay(this, true, this.gateX, this.groundY, missionId);
      }
      if (this.defenseLayout.showCampBackground) this.showCampBackground();
      if (this.defenseLayout.showZoneMarkers) this.showDefenseZones();
      if (this.isShrine) this.showShrineMarkers();
    } else {
      this.showAmbushMarker();
    }
    this.createPlayer();
    this.heroAbilities = new HeroAbilitySystem(this);
    if (MissionBridge.isGateGuardActive() && this.gate) {
      this.gateGuard = new GateGuard(this, this.gateX - 70, this.groundY);
    }
    if (this.defenseLayout.hazards.length > 0) {
      this.hazardManager = new HazardManager(this, this.defenseLayout.hazards, this.worldWidth, this.groundY);
    }
    this.createLion();
    this.createEnemies();
    this.setupCamera();
    this.setupInput();
    this.setupEvents();
    this.showMissionIntro();
    this.startWaves();
    MusicManager.setBattle(false);
  }

  private onWaveStarted = (_waveNumber: number, isFinalWave: boolean): void => {
    if (this.defenseLayout.relicPulseOnFinalWave && isFinalWave && this.hazardManager) {
      this.time.delayedCall(600, () => {
        this.hazardManager?.triggerRelicPulse(this.gateX, this.groundY, this.enemies);
      });
    }
  };

  private onWaveCleared = (waveNumber: number): void => {
    const pool = this.defenseLayout.poisonPoolsBetweenWaves?.[waveNumber];
    if (pool && this.hazardManager) {
      this.hazardManager.addPoisonPool(pool.xStartRatio, pool.xEndRatio);
      const cam = this.cameras.main;
      const warn = this.add
        .text(cam.width / 2, cam.height / 2 - 100, 'Poison spreads!', {
          fontSize: '18px',
          color: '#66ff66',
          fontFamily: 'Georgia, serif',
          stroke: '#1a1428',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200);
      this.time.delayedCall(2000, () => warn.destroy());
    }
  };

  update(_time: number, delta: number): void {
    if (this.missionEnded) return;

    if (!this.scene.isPaused()) {
      this.elapsedMs += delta;
      MissionBridge.syncTimer(this.elapsedMs);
    }

    if (this.scene.isPaused()) return;

    this.player.update(this.cursors, this.wasd, delta);

    const enemyList = this.enemies.getChildren() as Enemy[];
    enemyList.forEach((enemy) => enemy.update(this.time.now));
    this.syncBossHud(enemyList);

    if (!this.isAmbush && !this.isCaravan) {
      for (const socket of this.buildSockets) {
        socket.updateHint(this.player);
      }
      this.towers.forEach((tower) => tower.update(this.time.now, enemyList.filter((e) => e.isAlive())));
      this.gate?.tickRegen(delta);
    } else if (this.isCaravan) {
      for (const socket of this.buildSockets) {
        socket.updateHint(this.player);
      }
      this.towers.forEach((tower) => tower.update(this.time.now, enemyList.filter((e) => e.isAlive())));
    }
    const defenseTarget = this.getDefenseTarget();
    this.lion?.update(this.time.now, enemyList.filter((e) => e.isAlive()), defenseTarget?.x);
    this.gateGuard?.update(this.time.now, enemyList);
    this.heroAbilities?.tickCooldownSync(MissionBridge.getActiveHeroId());
    this.hazardManager?.update(this.player, delta);
    this.eclipseOverlay?.update(this.player.x, delta);
    updateBiomeParallax(this, delta);
    this.handleInteractions(delta);

    if (this.isCaravan && this.caravan) {
      const reachedExit = this.caravan.update(delta, this.shouldCaravanMove());
      if (this.wavesCleared && reachedExit && this.pendingVictory) {
        this.handleVictory(this.pendingVictory);
      }
    }

    if (this.isSurvive && this.surviveDurationMs > 0 && this.elapsedMs >= this.surviveDurationMs) {
      this.triggerSunriseVictory();
    }

    const wave = useGameStore.getState().mission.currentWave;
    MusicManager.setBattle(wave > 0 && enemyList.some((e) => e.isAlive()));
  }

  private handleInteractions(delta: number): void {
    if (!this.isAmbush && (this.gate || this.caravan)) {
      const repairable = this.caravan ?? this.gate!;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, repairable.x, repairable.y);
      const near = dist < 130 && !repairable.isDestroyed();

      if (this.repairKey?.isDown || InputBridge.isHeld('repair')) {
        if (near && repairable.hp < repairable.maxHp) {
          const rate = MissionBridge.getRepairRate() * this.getRepairRateMultiplier();
          repairable.repair(rate * (delta / 1000));
          this.player.setRepairing(true);
          if (!this.repairing) {
            this.repairing = true;
            SoundManager.play('click');
          }
        } else {
          this.player.setRepairing(false);
        }
      } else {
        this.player.setRepairing(false);
        this.repairing = false;
      }
    }

    if (
      !this.isAmbush &&
      ((this.buildKey && Phaser.Input.Keyboard.JustDown(this.buildKey)) ||
        InputBridge.consumePulse('build'))
    ) {
      for (const socket of this.buildSockets) {
        if (socket.isBuilt()) continue;
        const distToSocket = Phaser.Math.Distance.Between(this.player.x, this.player.y, socket.x, socket.y);
        if (distToSocket < 90) {
          const built = socket.tryBuild();
          if (built) {
            this.handleBuiltStructure(built);
            break;
          }
        }
      }
    }

    if (
      (this.cycleBuildKey && Phaser.Input.Keyboard.JustDown(this.cycleBuildKey)) ||
      InputBridge.consumePulse('cycle_build')
    ) {
      SoundManager.play('click');
      useGameStore.getState().cycleBuildInMission();
    }

    if (
      (this.roarKey && Phaser.Input.Keyboard.JustDown(this.roarKey)) ||
      InputBridge.consumePulse('roar')
    ) {
      if (this.lion?.isActive()) {
        const enemies = this.enemies.getChildren() as Enemy[];
        this.lion.tryRoar(enemies.filter((e) => e.isAlive()));
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('Q'))) {
      const enemies = this.enemies.getChildren() as Enemy[];
      this.heroAbilities?.tryUseAbility(
        this.player.x,
        this.player.y,
        this.player.getFacingDirection(),
        enemies.filter((e) => e.isAlive()),
      );
    }
  }

  private createGround(): void {
    this.groundGroup = this.physics.add.staticGroup();

    for (let x = 0; x < this.worldWidth; x += 64) {
      const tile = this.groundGroup.create(x + 32, this.groundY + 16, this.groundTexture) as Phaser.Physics.Arcade.Sprite;
      tile.setDisplaySize(64, 32);
      tile.refreshBody();
    }

    this.physics.world.setBounds(0, 0, this.worldWidth, GAME_HEIGHT);
  }

  private createBuildSockets(): void {
    const ratios = [
      this.defenseLayout.socketXRatio,
      ...(this.defenseLayout.extraSocketXRatios ?? []),
    ];
    this.buildSockets = ratios.map((ratio) => new BuildSocket(this, this.worldWidth * ratio, this.groundY));
  }

  private getRepairRateMultiplier(): number {
    for (const station of this.repairStations) {
      if (station.isPlayerInRange(this.player.x, this.player.y)) {
        return station.repairMultiplier;
      }
    }
    return 1;
  }

  private handleBuiltStructure(built: BuiltStructure): void {
    if (built instanceof Barricade) {
      this.registerBarricade(built);
    } else if (built instanceof RepairStation) {
      this.repairStations.push(built);
    } else if (built instanceof LionDen) {
      this.anchorLionAtDen(built);
    } else {
      this.towers.push(built);
    }
  }

  private anchorLionAtDen(den: LionDen): void {
    if (!MissionBridge.isLionUnlocked()) return;
    if (!this.lion) {
      this.lion = new Lion(this, den.denX, this.groundY, this.player);
      this.physics.add.collider(this.lion, this.groundGroup);
    } else {
      this.lion.setPosition(den.denX, this.groundY);
      (this.lion.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
  }

  private registerBarricade(barricade: Barricade): void {
    this.barricades.push(barricade);
    this.physics.add.collider(this.enemies, barricade);
    this.syncEnemyBarricades();
  }

  private syncEnemyBarricades(): void {
    const active = this.barricades.filter((b) => !b.isDestroyed());
    this.enemies.getChildren().forEach((child) => {
      (child as Enemy).setBarricades(active);
    });
  }

  private shouldCaravanMove(): boolean {
    if (this.wavesCleared) return true;
    const m = useGameStore.getState().mission;
    if (m.betweenWaves) return true;
    if (m.currentWave === 0 && m.enemiesRemaining === 0) return true;
    return false;
  }

  private getDefenseTarget(): DefenseTarget | null {
    return this.caravan ?? this.gate;
  }

  private createCaravan(): void {
    const maxHp = MissionBridge.getGateMaxHp();
    this.caravan = new Caravan(this, 280, this.groundY, this.caravanExitX, maxHp);
  }

  private createGate(): void {
    const maxHp = MissionBridge.getGateMaxHp();
    const regenRate = this.isOasis ? MissionBridge.getOasisRegenRate() : 0;
    this.gate = new Gate(this, this.gateX, this.groundY, maxHp, this.gateLabel, this.gateTexture, regenRate);
  }

  private createPlayer(): void {
    let spawnXPos = this.worldWidth * this.defenseLayout.playerSpawnXRatio;
    if (this.isShrine) spawnXPos = this.worldWidth / 2 + 80;
    if (this.isCaravan && this.caravan) spawnXPos = this.caravan.x - 70;
    const maxHp = MissionBridge.getPlayerMaxHp();
    const swordDamage = MissionBridge.getSwordDamage();

    this.player = new Player(this, spawnXPos, this.groundY, maxHp, swordDamage);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 44);
    body.setOffset(4, 4);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.groundGroup);
    this.player.setAttackCallback((hitbox, damage, knockbackForce, aoe) =>
      this.handlePlayerAttack(hitbox, damage, knockbackForce, aoe),
    );
    this.player.setProjectileCallback((x, y, damage) => this.handleProjectileHit(x, y, damage));
    this.player.setWarCryCallback((cx, cy, damage) => this.handleWarCry(cx, cy, damage));
  }

  private handleWarCry(centerX: number, centerY: number, damage: number): void {
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.isAlive()) return;
      const d = Phaser.Math.Distance.Between(centerX, centerY, enemy.x, enemy.y - 20);
      if (d < 140) {
        enemy.applyStun(2000);
        const knockbackDir = enemy.x > this.player.x ? 1 : -1;
        enemy.takeDamage(damage, knockbackDir, 200);
      }
    });
  }

  private handleProjectileHit(x: number, y: number, damage: number): void {
    const time = this.time.now;
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.isAlive()) return;
      const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y - 20);
      if (d < 34) {
        const knockbackDir = enemy.x > this.player.x ? 1 : -1;
        enemy.takeProjectileDamage(damage, knockbackDir, time);
      }
    });
  }

  private createLion(): void {
    if (!MissionBridge.isLionUnlocked()) return;

    const spawnX = this.worldWidth * 0.52;
    this.lion = new Lion(this, spawnX, this.groundY, this.player);
    this.physics.add.collider(this.lion, this.groundGroup);
  }

  private createEnemies(): void {
    this.enemies = this.add.group();

    this.events.on('enemy-spawned', (enemy: Enemy) => {
      this.physics.add.collider(enemy, this.groundGroup);
      for (const barricade of this.barricades) {
        if (!barricade.isDestroyed()) {
          this.physics.add.collider(enemy, barricade);
        }
      }
      enemy.setBarricades(this.barricades.filter((b) => !b.isDestroyed()));
    });
  }

  private handlePlayerAttack(
    hitbox: Phaser.Geom.Rectangle,
    damage: number,
    knockbackForce: number,
    aoe?: { x: number; y: number; radius: number },
  ): void {
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.isAlive()) return;

      let hit = false;
      if (aoe) {
        const d = Phaser.Math.Distance.Between(aoe.x, aoe.y, enemy.x, enemy.y - 20);
        hit = d < aoe.radius;
      } else {
        hit = Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds());
      }

      if (hit) {
        const knockbackDir = enemy.x > this.player.x ? 1 : -1;
        enemy.takeDamage(damage, knockbackDir, knockbackForce);
      }
    });
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, this.worldWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(200, 100);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: bindKey(this, 'jump'),
      A: bindKey(this, 'move_left'),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: bindKey(this, 'move_right'),
    };
    this.repairKey = bindKey(this, 'repair');
    this.buildKey = bindKey(this, 'build');
    this.cycleBuildKey = bindKey(this, 'cycle_build');
    this.roarKey = bindKey(this, 'lion_roar');

    const pauseKey = getKeyBindings().pause;
    this.input.keyboard.on(`keydown-${pauseKey}`, () => {
      if (this.missionEnded) return;
      SoundManager.play('click');
      useGameStore.getState().togglePause();
    });

    this.input.keyboard.on('keydown-Y', () => {
      if (this.missionEnded) return;
      if (!useGameStore.getState().mission.awaitingWaveStart) return;
      SoundManager.play('wave');
      MissionControlBridge.requestStartWave();
    });
  }

  private setupEvents(): void {
    this.events.on('mission-defeat', () => this.handleDefeat());
    this.events.on('mission-victory', (data: { goldEarned: number; xpEarned: number }) =>
      this.handleVictory(data),
    );
    this.events.on('wave-started', this.onWaveStarted);
    this.events.on('wave-cleared', this.onWaveCleared);
    this.events.on('barricade-destroyed', () => this.syncEnemyBarricades());
    this.events.on('boss-summon', this.onBossSummon);
    this.events.on('waves-cleared', (data: { goldEarned: number; xpEarned: number }) => {
      this.wavesCleared = true;
      this.pendingVictory = data;
      const banner = this.add
        .text(GAME_WIDTH / 2, 100, 'Waves cleared — reach the exit!', {
          fontSize: '18px',
          color: '#d4a843',
          fontFamily: 'Georgia, serif',
          stroke: '#1a1428',
          strokeThickness: 3,
        })
        .setScrollFactor(0)
        .setDepth(200);
      this.time.delayedCall(2500, () => banner.destroy());
    });
  }

  private syncBossHud(enemies: Enemy[]): void {
    const boss = enemies.find((e) => e.isAlive() && e.getBossHudInfo());
    if (boss) {
      const info = boss.getBossHudInfo()!;
      MissionBridge.syncBoss(info.hp, info.maxHp, info.name, info.phase);
      if (info.phase !== this.lastBossPhase) {
        if (info.phase > 0) SoundManager.play('boss_phase');
        MusicManager.setBossPhase(info.phase);
        this.lastBossPhase = info.phase;
      }
    } else if (useGameStore.getState().mission.bossMaxHp > 0) {
      MissionBridge.clearBoss();
      this.lastBossPhase = -1;
    }
  }

  private onBossSummon = (data: { type: string; count: number; x: number; y: number }): void => {
    const target = this.getDefenseTarget();
    const mult = MissionBridge.getNgPlusMultiplier();
    for (let i = 0; i < data.count; i++) {
      const enemy = new Enemy(
        this,
        data.x + (i - (data.count - 1) / 2) * 72,
        this.groundY - 28,
        data.type,
        target,
        this.player,
        { statMultiplier: mult },
      );
      this.enemies.add(enemy);
      const remaining = useGameStore.getState().mission.enemiesRemaining + 1;
      MissionBridge.syncWave(useGameStore.getState().mission.currentWave, remaining);
    }
    this.syncEnemyBarricades();
  };

  private startWaves(): void {
    const missionId = this.registry.get('missionId') as string;
    const mission = getMissionById(missionId);
    if (!mission) return;

    this.waveManager = new WaveManager(
      this,
      mission,
      this.spawnX,
      this.groundY,
      this.getDefenseTarget(),
      this.player,
      this.enemies,
      this.isShrine ? this.rightSpawnX : undefined,
      this.isCaravan && this.caravan ? () => this.caravan!.x : undefined,
    );
    this.waveManager.start();
    MissionControlBridge.register(() => this.waveManager.beginNextWave());
  }

  private showCampBackground(): void {
    const campX = this.gateX + 60;
    for (let i = 0; i < 3; i++) {
      const tent = this.add.image(campX + i * 55, this.groundY - 5, 'dune_mid');
      tent.setOrigin(0.5, 1).setScale(0.35, 0.25).setTint(0x8b6914).setAlpha(0.7).setDepth(3);
    }
    for (let i = 0; i < 4; i++) {
      const lantern = this.add.circle(campX - 20 + i * 40, this.groundY - 45, 4, 0xffcc66, 0.8);
      lantern.setDepth(4);
    }
    this.add
      .text(campX + 80, this.groundY - 95, 'NAHRAN CAMP', {
        fontSize: '11px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setAlpha(0.7)
      .setDepth(3);
  }

  private showDefenseZones(): void {
    const buildX = this.buildSockets[0]?.x ?? this.socketX;
    const zones = [
      { x: this.spawnX + 80, label: 'SPAWN' },
      { x: (this.spawnX + buildX) / 2, label: 'FIGHT' },
      { x: buildX, label: 'BUILD' },
      { x: (buildX + this.gateX) / 2, label: 'DEFEND' },
    ];
    for (const zone of zones) {
      this.add
        .text(zone.x, this.groundY - 115, zone.label, {
          fontSize: '10px',
          color: '#ffffff',
          fontFamily: 'Georgia, serif',
        })
        .setOrigin(0.5)
        .setAlpha(0.35)
        .setDepth(2);
    }
  }

  private showCaravanRoute(): void {
    this.add
      .text(this.caravanExitX, this.groundY - 110, 'CARAVAN EXIT →', {
        fontSize: '13px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setDepth(2);

    const startX = 280;
    for (const ratio of [0.3, 0.55, 0.75]) {
      const x = startX + (this.caravanExitX - startX) * ratio;
      this.add
        .text(x, this.groundY - 95, '⚠ AMBUSH', {
          fontSize: '10px',
          color: '#ff8844',
          fontFamily: 'Georgia, serif',
        })
        .setOrigin(0.5)
        .setAlpha(0.65)
        .setDepth(2);
    }
  }

  private showShrineMarkers(): void {
    this.add
      .text(this.spawnX, this.groundY - 100, '← WEST', {
        fontSize: '12px',
        color: '#aa8866',
        fontFamily: 'Georgia, serif',
      })
      .setDepth(2);

    this.add
      .text(this.rightSpawnX, this.groundY - 100, 'EAST →', {
        fontSize: '12px',
        color: '#aa8866',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(1, 0)
      .setDepth(2);
  }

  private showAmbushMarker(): void {
    this.add
      .text(this.worldWidth - 200, this.groundY - 90, 'CARAVAN ROUTE →', {
        fontSize: '14px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5)
      .setDepth(3);

    const ambush = this.add
      .text(GAME_WIDTH / 2, 50, 'AMBUSH!', {
        fontSize: '22px',
        color: '#ff8844',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0);

    this.tweens.add({
      targets: ambush,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 1500,
      onComplete: () => ambush.destroy(),
    });
  }

  private showMissionIntro(): void {
    const missionId = this.registry.get('missionId') as string;
    const mission = getMissionById(missionId);
    const title = mission?.name ?? 'Defense Mission';
    const objective = mission?.objective ?? 'Protect the gate.';

    const banner = this.add
      .text(GAME_WIDTH / 2, 70, title, {
        fontSize: '28px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(200);

    const objectiveText = this.add
      .text(GAME_WIDTH / 2, 110, objective, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(200);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 600,
      yoyo: true,
      hold: 2000,
      onComplete: () => banner.destroy(),
    });

    this.tweens.add({
      targets: objectiveText,
      alpha: 1,
      duration: 600,
      yoyo: true,
      hold: 2000,
      onComplete: () => objectiveText.destroy(),
    });
  }

  private triggerSunriseVictory(): void {
    if (this.missionEnded) return;

    const banner = this.add
      .text(GAME_WIDTH / 2, 90, '☀ Sunrise!', {
        fontSize: '36px',
        color: '#ffd700',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1.15,
      duration: 600,
      yoyo: true,
      hold: 800,
    });

    this.cameras.main.flash(800, 255, 220, 150, false, undefined, 0.25);

    const rewards = this.waveManager.getRewards();
    this.time.delayedCall(1200, () => {
      banner.destroy();
      this.handleVictory(rewards);
    });
  }

  private handleVictory(data: { goldEarned: number; xpEarned: number }): void {
    if (this.missionEnded) return;
    this.missionEnded = true;

    const banner = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Victory!', {
        fontSize: '48px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.time.delayedCall(2000, () => {
      banner.destroy();
      const drops = MissionBridge.getGoldCollected();
      MissionBridge.endVictory(data.goldEarned + drops, data.xpEarned);
    });
  }

  private handleDefeat(): void {
    if (this.missionEnded) return;
    this.missionEnded = true;

    const banner = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Defeat', {
        fontSize: '48px',
        color: '#ff4444',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.time.delayedCall(2000, () => {
      banner.destroy();
      MissionBridge.endDefeat();
    });
  }

  shutdown(): void {
    this.waveManager?.destroy();
    this.eclipseOverlay?.destroy();
    InputBridge.reset();
    this.events.off('mission-defeat');
    this.events.off('mission-victory');
    this.events.off('wave-started', this.onWaveStarted);
    this.events.off('wave-cleared', this.onWaveCleared);
    this.events.off('enemy-spawned');
  }
}
