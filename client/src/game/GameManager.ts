import Phaser from 'phaser';
import { createGameConfig } from './config/gameConfig';

export class GameManager {
  private game: Phaser.Game | null = null;

  constructor(private parent: HTMLElement, private missionId: string) {}

  start(): void {
    if (this.game) return;
    this.game = new Phaser.Game(createGameConfig(this.parent, this.missionId));
  }

  pause(): void {
    this.game?.scene.pause('MissionScene');
  }

  resume(): void {
    this.game?.scene.resume('MissionScene');
  }

  destroy(): void {
    this.game?.destroy(true);
    this.game = null;
  }
}
