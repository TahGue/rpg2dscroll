import Phaser from 'phaser';
import { createExploreGameConfig } from './config/gameConfig';

export class WorldExploreManager {
  private game: Phaser.Game | null = null;

  constructor(private parent: HTMLElement, private regionId: string) {}

  start(): void {
    if (this.game) return;
    this.game = new Phaser.Game(createExploreGameConfig(this.parent, this.regionId));
  }

  refresh(): void {
    this.game?.scene.getScene('WorldExploreScene')?.events.emit('overworld-refresh');
  }

  pause(): void {
    this.game?.scene.getScene('WorldExploreScene')?.events.emit('overworld-pause');
  }

  resume(): void {
    this.game?.scene.getScene('WorldExploreScene')?.events.emit('overworld-resume');
  }

  destroy(): void {
    this.game?.destroy(true);
    this.game = null;
  }

  teleport(x: number, y: number): void {
    this.game?.scene.getScene('WorldExploreScene')?.events.emit('overworld-teleport', x, y);
  }
}
