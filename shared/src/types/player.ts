export interface PlayerStats {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  speed: number;
  stamina: number;
  xp: number;
  level: number;
  gold: number;
}

export interface PlayerSaveData {
  stats: PlayerStats;
  swordLevel: number;
  gateLevel: number;
}

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  damage: 10,
  defense: 0,
  speed: 200,
  stamina: 100,
  xp: 0,
  level: 1,
  gold: 0,
};
