export type MissionType = 'gate_defense' | 'caravan' | 'shrine' | 'oasis' | 'boss' | 'ambush' | 'survive';
export type LocationBiome = 'desert_night' | 'desert_day' | 'oasis' | 'ruins';
export type NodeType = 'camp' | 'defense' | 'resource' | 'ambush' | 'lore' | 'boss' | 'shop';

export interface WaveEnemySpawn {
  type: string;
  count: number;
  spawnDelayMs: number;
  /** For shrine missions — which side enemies enter from */
  spawnSide?: 'left' | 'right';
}

export interface WaveDefinition {
  waveNumber: number;
  enemies: WaveEnemySpawn[];
  timeBeforeWaveMs: number;
  rewardGold: number;
}

export interface MissionDefinition {
  id: string;
  locationId: string;
  name: string;
  description: string;
  /** Clear in-mission goal shown to the player */
  objective: string;
  /** Narrative text for mission briefing */
  storyBrief?: string;
  type: MissionType;
  biome: LocationBiome;
  difficulty: 1 | 2 | 3 | 4 | 5;
  waves: WaveDefinition[];
  baseRewardGold: number;
  perfectGateBonusGold: number;
  unlockRequirement?: string;
  surviveDurationMs?: number;
  /** Enemy type id — mission wins when this boss is slain */
  requiresBossKill?: string;
}

export interface LocationNode {
  id: string;
  name: string;
  description: string;
  type: NodeType;
  biome: LocationBiome;
  difficulty: 1 | 2 | 3 | 4 | 5;
  missionId?: string;
  /** Lore entry id revealed when visiting this node */
  loreId?: string;
  position: { x: number; y: number };
  unlockRequirement?: string;
}
