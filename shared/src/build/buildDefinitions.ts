export interface BuildDefinition {
  id: string;
  name: string;
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
  goldCost: 50,
  ironCost: 0,
  woodCost: 0,
  damage: 15,
  range: 420,
  fireRateMs: 1400,
};

export const SPIKE_TRAP: BuildDefinition = {
  id: 'spike_trap',
  name: 'Spike Trap',
  goldCost: 35,
  ironCost: 0,
  woodCost: 2,
  damage: 25,
  range: 90,
  fireRateMs: 900,
};

export const BARRICADE: BuildDefinition = {
  id: 'barricade',
  name: 'Barricade',
  goldCost: 40,
  ironCost: 0,
  woodCost: 3,
  damage: 0,
  range: 0,
  fireRateMs: 0,
  maxHp: 140,
};

export const REPAIR_STATION: BuildDefinition = {
  id: 'repair_station',
  name: 'Repair Station',
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
  goldCost: 55,
  ironCost: 0,
  woodCost: 2,
  damage: 0,
  range: 0,
  fireRateMs: 0,
};

export const BUILD_OPTIONS: BuildDefinition[] = [
  ARROW_TOWER,
  SPIKE_TRAP,
  BARRICADE,
  REPAIR_STATION,
  IRON_TOWER,
  LION_DEN,
];

export function getBuildDefinition(id: string): BuildDefinition | undefined {
  return BUILD_OPTIONS.find((b) => b.id === id);
}

export const BUILD_SOCKET_COST = ARROW_TOWER.goldCost;
