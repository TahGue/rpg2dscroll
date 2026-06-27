import Phaser from 'phaser';
import type { MissionDefinition, WaveDefinition, WaveEnemySpawn } from '@malik/shared';
import { getDefenseLayout, isBossType } from '@malik/shared';
import { Enemy } from '../entities/Enemy';
import type { DefenseTarget } from '../entities/DefenseTarget';
import type { Player } from '../entities/Player';
import { MissionBridge } from './MissionBridge';
import { SoundManager } from './SoundManager';

interface EnemyDeathPayload {
  xp: number;
  enemyType: string;
}

export class WaveManager {
  private waveIndex = -1;
  private aliveCount = 0;
  private spawning = false;
  private totalXp = 0;
  private waveGold = 0;
  private ended = false;
  private waveRewardClaimed = false;
  private waveClearScheduled = false;
  private bossKillRequired: string | undefined;
  private bossKilled = false;
  private statMultiplier: number;
  private isAmbush: boolean;
  private isShrine: boolean;
  private isCaravan: boolean;
  private isSurvive: boolean;
  private isOasis: boolean;
  private rightSpawnX: number;

  constructor(
    private scene: Phaser.Scene,
    private mission: MissionDefinition,
    private spawnX: number,
    private groundY: number,
    private target: DefenseTarget | null,
    private player: Player,
    private enemies: Phaser.GameObjects.Group,
    rightSpawnX?: number,
    private getCaravanSpawnX?: () => number,
  ) {
    this.isAmbush = mission.type === 'ambush';
    this.isShrine = mission.type === 'shrine';
    this.isCaravan = mission.type === 'caravan';
    this.isSurvive = mission.type === 'survive';
    this.isOasis = mission.type === 'oasis';
    this.rightSpawnX = rightSpawnX ?? spawnX;
    this.bossKillRequired = mission.requiresBossKill;
    this.statMultiplier = MissionBridge.getNgPlusMultiplier();
    scene.events.on('enemy-died', this.onEnemyDied, this);
  }

  start(): void {
    MissionBridge.syncTotalWaves(this.mission.waves.length);
    if (this.isAmbush) {
      const layout = getDefenseLayout(this.mission.id, this.mission.type);
      this.scheduleNextWave(layout.prepPhaseMs ?? 1200);
      return;
    }
    MissionBridge.syncPreparing(true);
    this.showPrepBanner();
    const layout = getDefenseLayout(this.mission.id, this.mission.type);
    const prepMs = layout.prepPhaseMs ?? (this.isSurvive ? 5000 : 7000);
    this.scheduleNextWave(prepMs);
  }

  destroy(): void {
    this.scene.events.off('enemy-died', this.onEnemyDied, this);
  }

  getRewards(): { goldEarned: number; xpEarned: number } {
    let gold = this.mission.baseRewardGold + this.waveGold;
    if (this.target && this.target.maxHp > 0 && this.target.hp / this.target.maxHp >= 1) {
      gold += this.mission.perfectGateBonusGold;
    }
    return { goldEarned: gold, xpEarned: this.totalXp };
  }

  private scheduleNextWave(delayMs: number): void {
    this.scene.time.delayedCall(delayMs, () => this.startNextWave());
  }

  private startNextWave(): void {
    if (this.ended) return;

    this.waveRewardClaimed = false;
    this.waveClearScheduled = false;
    MissionBridge.syncPreparing(false);
    MissionBridge.syncWaveBreak(false);
    this.waveIndex++;
    const wave = this.mission.waves[this.waveIndex];

    if (!wave) {
      this.onAllWavesComplete();
      return;
    }

    this.showWaveBanner(wave);
    SoundManager.play('wave');
    this.scene.events.emit('wave-started', wave.waveNumber, this.waveIndex >= this.mission.waves.length - 1);
    this.spawning = true;
    this.spawnWave(wave);
  }

  private spawnWave(wave: WaveDefinition): void {
    let delay = 0;
    let totalToSpawn = 0;

    for (const group of wave.enemies) {
      totalToSpawn += group.count;
      for (let i = 0; i < group.count; i++) {
        const side = this.resolveSpawnSide(group, i);
        this.scene.time.delayedCall(delay, () => this.spawnEnemy(group.type, side));
        delay += group.spawnDelayMs;
      }
    }

    this.aliveCount += totalToSpawn;
    MissionBridge.syncWave(wave.waveNumber, this.aliveCount);

    this.scene.time.delayedCall(delay + 100, () => {
      this.spawning = false;
      this.checkWaveClear(wave);
    });
  }

  private resolveSpawnSide(group: WaveEnemySpawn, index: number): 'left' | 'right' {
    if (group.spawnSide) return group.spawnSide;
    if (this.isShrine) return index % 2 === 0 ? 'left' : 'right';
    return 'left';
  }

  private spawnEnemy(type: string, side: 'left' | 'right'): void {
    if (isBossType(type)) {
      this.showBossBanner(type);
    }
    const x =
      this.isCaravan && this.getCaravanSpawnX
        ? this.getCaravanSpawnX() + Phaser.Math.Between(240, 340)
        : side === 'left'
          ? this.spawnX
          : this.rightSpawnX;
    const enemy = new Enemy(
      this.scene,
      x + Phaser.Math.Between(-20, 20),
      this.groundY - 28,
      type,
      this.target,
      this.player,
      { ambush: this.isAmbush, statMultiplier: this.statMultiplier },
    );
    this.enemies.add(enemy);
    this.scene.events.emit('enemy-spawned', enemy);
  }

  private onEnemyDied = (payload: EnemyDeathPayload | number): void => {
    const xp = typeof payload === 'number' ? payload : payload.xp;
    const enemyType = typeof payload === 'number' ? '' : payload.enemyType;

    this.aliveCount = Math.max(0, this.aliveCount - 1);
    this.totalXp += xp;
    MissionBridge.syncWave(this.waveIndex + 1, this.aliveCount);

    if (this.bossKillRequired && enemyType === this.bossKillRequired) {
      this.bossKilled = true;
      this.triggerBossVictory();
      return;
    }

    const wave = this.mission.waves[this.waveIndex];
    if (wave && !this.spawning && this.aliveCount <= 0) {
      if (!this.waveRewardClaimed) {
        this.waveRewardClaimed = true;
        this.waveGold += wave.rewardGold;
      }
      this.checkWaveClear(wave);
    }
  };

  private triggerBossVictory(): void {
    if (this.ended) return;
    this.ended = true;
    const rewards = this.getRewards();
    this.scene.events.emit('mission-victory', rewards);
  }

  private checkWaveClear(wave: WaveDefinition): void {
    if (this.spawning || this.aliveCount > 0 || this.ended || this.waveClearScheduled) return;

    this.waveClearScheduled = true;

    const isLastWave = this.waveIndex >= this.mission.waves.length - 1;
    if (isLastWave) {
      this.onAllWavesComplete();
    } else {
      MissionBridge.syncWaveBreak(true);
      this.showWaveBreakBanner(wave.timeBeforeWaveMs);
      this.scene.events.emit('wave-cleared', wave.waveNumber);
      this.scheduleNextWave(wave.timeBeforeWaveMs);
    }
  }

  private onAllWavesComplete(): void {
    if (this.ended) return;

    if (this.bossKillRequired && !this.bossKilled) {
      this.showBossWaitBanner();
      return;
    }

    if (this.isSurvive) {
      this.showHoldBanner();
      this.waveClearScheduled = false;
      this.waveIndex = this.mission.waves.length - 2;
      this.scheduleNextWave(4000);
      return;
    }

    this.finishMission();
  }

  private finishMission(): void {
    if (this.ended) return;
    this.ended = true;

    if (this.isCaravan) {
      let gold = this.mission.baseRewardGold + this.waveGold;
      if (this.target && this.target.maxHp > 0 && this.target.hp / this.target.maxHp >= 1) {
        gold += this.mission.perfectGateBonusGold;
      }
      this.scene.events.emit('waves-cleared', { goldEarned: gold, xpEarned: this.totalXp });
      return;
    }

    const rewards = this.getRewards();
    this.scene.events.emit('mission-victory', rewards);
  }

  private showBossBanner(type: string): void {
    const cam = this.scene.cameras.main;
    const label = type === 'shadow_emir' ? 'SHADOW EMIR' : 'BOSS INCOMING';
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2, label, {
        fontSize: '32px',
        color: '#ff4444',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      scale: 1.2,
      duration: 1500,
      delay: 500,
      onComplete: () => text.destroy(),
    });
  }

  private showBossWaitBanner(): void {
    const cam = this.scene.cameras.main;
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 60, 'Slay the beast to claim victory!', {
        fontSize: '20px',
        color: '#ff8844',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.time.delayedCall(2500, () => text.destroy());
  }

  private showPrepBanner(): void {
    const cam = this.scene.cameras.main;
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 50, 'Prepare — build & repair!', {
        fontSize: '24px',
        color: '#88ffaa',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.time.delayedCall(4500, () => text.destroy());
  }

  private showWaveBreakBanner(breakMs: number): void {
    const cam = this.scene.cameras.main;
    const sec = Math.round(breakMs / 1000);
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 60, `Wave cleared — prepare! (${sec}s)`, {
        fontSize: '22px',
        color: '#88ffaa',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.time.delayedCall(Math.min(breakMs, 3500), () => text.destroy());
  }

  private showWaveBanner(wave: WaveDefinition): void {
    const cam = this.scene.cameras.main;
    let label = `Wave ${wave.waveNumber}`;
    if (this.isAmbush) label = `Ambush Wave ${wave.waveNumber}`;
    else if (this.isCaravan) label = `Escort Wave ${wave.waveNumber}`;
    else if (this.isShrine) label = `Shrine Wave ${wave.waveNumber}`;
    else if (this.isSurvive) label = `Night Wave ${wave.waveNumber}`;
    else if (this.isOasis) label = `Oasis Wave ${wave.waveNumber}`;

    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 40, label, {
        fontSize: '36px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1.1,
      duration: 400,
      yoyo: true,
      hold: 800,
      onComplete: () => text.destroy(),
    });
  }

  private showHoldBanner(): void {
    const cam = this.scene.cameras.main;
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 80, 'Hold until sunrise…', {
        fontSize: '22px',
        color: '#ffcc88',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1800,
      onComplete: () => text.destroy(),
    });
  }
}
