import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MissionScene } from '../scenes/MissionScene';
import { WorldExploreScene } from '../scenes/WorldExploreScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

function baseConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1a1428',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, MissionScene, WorldExploreScene],
  };
}

export function createGameConfig(parent: HTMLElement, missionId: string): Phaser.Types.Core.GameConfig {
  return {
    ...baseConfig(parent),
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 900 },
        debug: false,
      },
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('missionId', missionId);
        game.registry.set('bootTarget', 'MissionScene');
      },
    },
  };
}

export function createExploreGameConfig(parent: HTMLElement, regionId: string): Phaser.Types.Core.GameConfig {
  return {
    ...baseConfig(parent),
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('bootTarget', 'WorldExploreScene');
        game.registry.set('regionId', regionId);
      },
    },
  };
}
