import Phaser from 'phaser';
import type { LocationBiome } from '@malik/shared';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';

interface ParallaxEntry {
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse;
  phase: number;
  amp: number;
  speed: number;
}

const PARALLAX_KEY = 'biomeParallaxEntries';

interface BiomeConfig {
  skyColor: number;
  groundTexture: string;
  gateLabel: string;
  showStars: boolean;
  showMoon: boolean;
  farDuneColor: number;
  midDuneColor: number;
}

const BIOMES: Record<LocationBiome, BiomeConfig> = {
  desert_night: {
    skyColor: 0x1a1428,
    groundTexture: 'ground',
    gateLabel: 'CAMP GATE',
    showStars: true,
    showMoon: true,
    farDuneColor: 0x3d2a1a,
    midDuneColor: 0x5c4033,
  },
  desert_day: {
    skyColor: 0x87a8c4,
    groundTexture: 'ground_day',
    gateLabel: 'CAMP GATE',
    showStars: false,
    showMoon: false,
    farDuneColor: 0xc4a35a,
    midDuneColor: 0xd4b86a,
  },
  oasis: {
    skyColor: 0x0f2838,
    groundTexture: 'ground_oasis',
    gateLabel: 'OASIS WELL',
    showStars: true,
    showMoon: false,
    farDuneColor: 0x1a4030,
    midDuneColor: 0x2a6040,
  },
  ruins: {
    skyColor: 0x2a2030,
    groundTexture: 'ground_ruins',
    gateLabel: 'ANCIENT GATE',
    showStars: true,
    showMoon: true,
    farDuneColor: 0x4a3a30,
    midDuneColor: 0x6a5a40,
  },
};

export function buildBiomeBackground(
  scene: Phaser.Scene,
  biome: LocationBiome,
  worldWidth: number,
  groundY: number,
  missionId?: string,
): { gateLabel: string; groundTexture: string } {
  const config = BIOMES[biome] ?? BIOMES.desert_night;

  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, config.skyColor).setScrollFactor(0);

  if (config.showStars) {
    for (let i = 0; i < 60; i++) {
      const star = scene.add.image(
        Phaser.Math.Between(0, worldWidth),
        Phaser.Math.Between(20, GAME_HEIGHT * 0.5),
        'star',
      );
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
      star.setScrollFactor(Phaser.Math.FloatBetween(0.05, 0.15));
    }
  }

  for (let x = 0; x < worldWidth; x += 200) {
    const dune = scene.add.image(x, groundY - 60, 'dune_far');
    dune.setOrigin(0, 1).setScrollFactor(0.2).setAlpha(0.6).setTint(config.farDuneColor);
    registerParallax(scene, dune, 0.35, 0.000018);
  }

  for (let x = 100; x < worldWidth; x += 160) {
    const dune = scene.add.image(x, groundY - 30, 'dune_mid');
    dune.setOrigin(0, 1).setScrollFactor(0.4).setAlpha(0.8).setTint(config.midDuneColor);
    registerParallax(scene, dune, 0.55, 0.000028);
  }

  if (config.showMoon) {
    scene.add.circle(worldWidth * 0.75, 100, 40, 0xd4c4a0, 0.15).setScrollFactor(0.1);
  }

  if (biome === 'oasis') {
    for (let x = 200; x < worldWidth; x += 350) {
      const palm = scene.add.image(x, groundY - 10, 'palm_tree');
      palm.setOrigin(0.5, 1).setScrollFactor(0.55).setAlpha(0.85);
      registerParallax(scene, palm, 0.2, 0.000012);
    }
    const water = scene.add.ellipse(worldWidth - 200, groundY + 4, 120, 30, 0x2a8090, 0.5);
    water.setScrollFactor(0.7).setDepth(1);
  }

  if (biome === 'desert_day') {
    scene.add.circle(worldWidth * 0.8, 90, 50, 0xffe066, 0.25).setScrollFactor(0.05);
  }

  if (missionId === 'mission-black-eclipse' || missionId === 'mission-shadow-emir') {
    scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0518, 0.35).setScrollFactor(0);
    scene.add.circle(worldWidth * 0.2, 80, 55, 0x331122, 0.4).setScrollFactor(0.08);
  }

  if (biome === 'ruins' && missionId === 'mission-scorpion-nest') {
    for (let x = 80; x < worldWidth * 0.35; x += 220) {
      const cave = scene.add.ellipse(x, groundY - 20, 70, 40, 0x1a1010, 0.85);
      cave.setScrollFactor(0.5).setDepth(2);
      const glow = scene.add.ellipse(x, groundY - 18, 40, 16, 0x44aa44, 0.35);
      glow.setScrollFactor(0.5).setDepth(2);
    }
  }

  for (let x = 0; x < worldWidth; x += 120) {
    const rock = scene.add.image(x + Phaser.Math.Between(0, 40), groundY - 4, 'particle_dust');
    rock.setScale(Phaser.Math.FloatBetween(1.2, 2.4)).setAlpha(0.12).setScrollFactor(1.1).setDepth(12).setTint(0x8b7355);
  }

  return { gateLabel: config.gateLabel, groundTexture: config.groundTexture };
}

function registerParallax(
  scene: Phaser.Scene,
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse,
  amp: number,
  speed: number,
): void {
  const entries = (scene.registry.get(PARALLAX_KEY) as ParallaxEntry[] | undefined) ?? [];
  entries.push({ obj, phase: Phaser.Math.FloatBetween(0, Math.PI * 2), amp, speed });
  scene.registry.set(PARALLAX_KEY, entries);
}

/** Subtle horizontal drift on parallax layers for living desert feel. */
export function updateBiomeParallax(scene: Phaser.Scene, delta: number): void {
  const entries = scene.registry.get(PARALLAX_KEY) as ParallaxEntry[] | undefined;
  if (!entries?.length) return;

  for (const entry of entries) {
    entry.phase += delta * entry.speed;
    const baseX = entry.obj.getData('parallaxBaseX') as number | undefined;
    if (baseX === undefined) {
      entry.obj.setData('parallaxBaseX', entry.obj.x);
    } else {
      entry.obj.x = baseX + Math.sin(entry.phase) * entry.amp;
    }
  }
}

export function getBiomeForMission(missionId: string): LocationBiome {
  if (missionId === 'mission-silent-oasis') return 'oasis';
  if (missionId === 'mission-bandit-road') return 'desert_day';
  if (missionId === 'mission-caravan-escort') return 'desert_day';
  if (missionId === 'mission-red-dune-pass') return 'desert_day';
  if (missionId === 'mission-shrine-sanctum') return 'ruins';
  if (missionId === 'mission-scorpion-nest') return 'ruins';
  if (missionId === 'mission-broken-watchtower') return 'ruins';
  if (missionId === 'mission-black-eclipse') return 'ruins';
  return 'desert_night';
}
