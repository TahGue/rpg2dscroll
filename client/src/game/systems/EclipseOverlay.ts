import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';
import { useGameStore } from '@/store/gameStore';

const BREAK_DARKNESS = 0.22;

export class EclipseOverlay {
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private relicGlow: Phaser.GameObjects.Arc | null = null;
  private currentAlpha = 0;
  private enabled: boolean;
  private gateX: number;
  private groundY: number;
  private maxDarkness: number;
  private pulsePhase = 0;

  constructor(
    scene: Phaser.Scene,
    enabled: boolean,
    gateX: number,
    groundY: number,
    missionId?: string,
  ) {
    this.enabled = enabled;
    this.gateX = gateX;
    this.groundY = groundY;
    this.maxDarkness = missionId === 'mission-shadow-emir' ? 0.78 : 0.62;
    if (!enabled) return;

    this.overlay = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x080410, 0)
      .setScrollFactor(0)
      .setDepth(150);

    const glowColor = missionId === 'mission-shadow-emir' ? 0x8844cc : 0x6688cc;
    this.relicGlow = scene.add
      .circle(gateX, groundY - 50, missionId === 'mission-shadow-emir' ? 110 : 90, glowColor, 0.12)
      .setDepth(4);
  }

  update(playerX: number, deltaMs: number): void {
    if (!this.enabled || !this.overlay) return;

    const mission = useGameStore.getState().mission;
    const combatActive =
      mission.currentWave > 0 && !mission.betweenWaves && mission.enemiesRemaining > 0;

    let target = combatActive ? this.maxDarkness : mission.betweenWaves ? BREAK_DARKNESS : 0.08;
    if (mission.bossPhase >= 2) {
      this.pulsePhase += deltaMs * 0.004;
      target = Math.min(this.maxDarkness, target + Math.sin(this.pulsePhase) * 0.08);
    }

    const distToGate = Math.abs(playerX - this.gateX);
    if (distToGate < 200) {
      target *= 0.35;
    } else if (distToGate < 360) {
      target *= 0.65;
    }

    const step = (deltaMs / 1000) * (combatActive ? 1.8 : 2.5);
    this.currentAlpha += (target - this.currentAlpha) * Math.min(1, step);
    this.overlay.setAlpha(this.currentAlpha);

    if (this.relicGlow) {
      const glowAlpha = 0.08 + (1 - this.currentAlpha / this.maxDarkness) * 0.22;
      this.relicGlow.setAlpha(glowAlpha);
      this.relicGlow.setPosition(this.gateX, this.groundY - 50);
    }
  }

  destroy(): void {
    this.overlay?.destroy();
    this.relicGlow?.destroy();
  }
}
