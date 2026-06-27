export interface BuildDefinition {
  id: string;
  name: string;
  role?: 'tower' | 'trap' | 'wall' | 'support';
  goldCost: number;
  ironCost: number;
  woodCost: number;
  damage: number;
  range: number;
  fireRateMs: number;
  maxHp?: number;
}

export const ARROW_TOWER: BuildDefinition = {
  id: 'arrow_tower',
  name: 'Arrow Tower',
  role: 'tower',
  goldCost: 50,
  ironCost: 0,
  woodCost: 0,
  damage: 15,
  range: 420,
  fireRateMs: 1400,
};

export const FIRE_TOWER: BuildDefinition = {
  id: 'fire_tower',
  name: 'Fire Tower',
  role: 'tower',
  goldCost: 70,
  ironCost: 1,
  woodCost: 2,
  damage: 12,
  range: 380,
  fireRateMs: 1650,
};

export const WATER_TOWER: BuildDefinition = {
  id: 'water_tower',
  name: 'Water Tower',
  role: 'tower',
  goldCost: 65,
  ironCost: 1,
  woodCost: 1,
  damage: 8,
  range: 360,
  fireRateMs: 1500,
};

export const RELIC_TOWER: BuildDefinition = {
  id: 'relic_tower',
  name: 'Relic Tower',
  role: 'tower',
  goldCost: 90,
  ironCost: 2,
  woodCost: 1,
  damage: 28,
  range: 430,
  fireRateMs: 1900,
};

export const BALLISTA: BuildDefinition = {
  id: 'ballista',
  name: 'Ballista',
  role: 'tower',
  goldCost: 95,
  ironCost: 3,
  woodCost: 2,
  damage: 42,
  range: 560,
  fireRateMs: 2600,
};

export const SPIKE_TRAP: BuildDefinition = {
  id: 'spike_trap',
  name: 'Spike Trap',
  role: 'trap',
  goldCost: 35,
  ironCost: 0,
  woodCost: 2,
  damage: 25,
  range: 90,
  fireRateMs: 900,
};

export const FIRE_POT: BuildDefinition = {
  id: 'fire_pot',
  name: 'Fire Pot',
  role: 'trap',
  goldCost: 45,
  ironCost: 0,
  woodCost: 2,
  damage: 16,
  range: 115,
  fireRateMs: 1400,
};

export const WATER_SLOW_TRAP: BuildDefinition = {
  id: 'water_slow_trap',
  name: 'Water Slow Trap',
  role: 'trap',
  goldCost: 40,
  ironCost: 0,
  woodCost: 1,
  damage: 7,
  range: 120,
  fireRateMs: 1100,
};

export const POISON_TRAP: BuildDefinition = {
  id: 'poison_trap',
  name: 'Poison Trap',
  role: 'trap',
  goldCost: 50,
  ironCost: 1,
  woodCost: 1,
  damage: 10,
  range: 105,
  fireRateMs: 1300,
};

export const SAND_PIT: BuildDefinition = {
  id: 'sand_pit',
  name: 'Sand Pit',
  role: 'trap',
  goldCost: 35,
  ironCost: 0,
  woodCost: 2,
  damage: 4,
  range: 130,
  fireRateMs: 1200,
};

export const LIGHT_TRAP: BuildDefinition = {
  id: 'light_trap',
  name: 'Light Trap',
  role: 'trap',
  goldCost: 60,
  ironCost: 1,
  woodCost: 1,
  damage: 20,
  range: 120,
  fireRateMs: 1500,
};

export const ROLLING_STONE: BuildDefinition = {
  id: 'rolling_stone',
  name: 'Rolling Stone',
  role: 'trap',
  goldCost: 70,
  ironCost: 2,
  woodCost: 0,
  damage: 44,
  range: 150,
  fireRateMs: 3500,
};

export const BARRICADE: BuildDefinition = {
  id: 'barricade',
  name: 'Barricade',
  role: 'wall',
  goldCost: 40,
  ironCost: 0,
  woodCost: 3,
  damage: 0,
  range: 0,
  fireRateMs: 0,
  maxHp: 140,
};

export const REINFORCED_WALL: BuildDefinition = {
  id: 'reinforced_wall',
  name: 'Reinforced Wall',
  role: 'wall',
  goldCost: 55,
  ironCost: 1,
  woodCost: 4,
  damage: 0,
  range: 0,
  fireRateMs: 0,
  maxHp: 210,
};

export const STONE_WALL: BuildDefinition = {
  id: 'stone_wall',
  name: 'Stone Wall',
  role: 'wall',
  goldCost: 75,
  ironCost: 2,
  woodCost: 2,
  damage: 0,
  range: 0,
  fireRateMs: 0,
  maxHp: 300,
};

export const SPIKED_WALL: BuildDefinition = {
  id: 'spiked_wall',
  name: 'Spiked Wall',
  role: 'wall',
  goldCost: 70,
  ironCost: 2,
  woodCost: 3,
  damage: 6,
  range: 0,
  fireRateMs: 0,
  maxHp: 240,
};

export const RELIC_WALL: BuildDefinition = {
  id: 'relic_wall',
  name: 'Relic Shield Wall',
  role: 'wall',
  goldCost: 95,
  ironCost: 3,
  woodCost: 1,
  damage: 0,
  range: 0,
  fireRateMs: 0,
  maxHp: 360,
};

export const REPAIR_STATION: BuildDefinition = {
  id: 'repair_station',
  name: 'Repair Station',
  role: 'support',
  goldCost: 30,
  ironCost: 0,
  woodCost: 1,
  damage: 0,
  range: 0,
  fireRateMs: 0,
};

export const IRON_TOWER: BuildDefinition = {
  id: 'iron_tower',
  name: 'Iron Tower',
  role: 'tower',
  goldCost: 45,
  ironCost: 2,
  woodCost: 0,
  damage: 22,
  range: 480,
  fireRateMs: 1200,
};

export const LION_DEN: BuildDefinition = {
  id: 'lion_den',
  name: 'Lion Den',
  role: 'support',
  goldCost: 55,
  ironCost: 0,
  woodCost: 2,
  damage: 0,
  range: 0,
  fireRateMs: 0,
};

export const BUILD_OPTIONS: BuildDefinition[] = [
  ARROW_TOWER,
  FIRE_TOWER,
  WATER_TOWER,
  RELIC_TOWER,
  BALLISTA,
  SPIKE_TRAP,
  FIRE_POT,
  WATER_SLOW_TRAP,
  POISON_TRAP,
  SAND_PIT,
  LIGHT_TRAP,
  ROLLING_STONE,
  BARRICADE,
  REINFORCED_WALL,
  STONE_WALL,
  SPIKED_WALL,
  RELIC_WALL,
  REPAIR_STATION,
  IRON_TOWER,
  LION_DEN,
];

export function getBuildDefinition(id: string): BuildDefinition | undefined {
  return BUILD_OPTIONS.find((b) => b.id === id);
}

export const BUILD_SOCKET_COST = ARROW_TOWER.goldCost;
