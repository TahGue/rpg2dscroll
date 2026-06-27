export interface DefenderDefinition {
  id: string;
  name: string;
  description: string;
  role: 'melee' | 'ranged' | 'repair' | 'tank' | 'support' | 'anti_shadow';
  hp: number;
  damage: number;
  attackRange: number;
  attackIntervalMs: number;
}

export type DefenderChoice =
  | 'gate_guard'
  | 'archer'
  | 'repair_worker'
  | 'hunter'
  | 'shield_guard'
  | 'water_carrier'
  | 'torch_bearer';

export const GATE_GUARD: DefenderDefinition = {
  id: 'gate_guard',
  name: 'Gate Guard',
  description: 'Holds the line near the gate and strikes nearby raiders.',
  role: 'melee',
  hp: 120,
  damage: 12,
  attackRange: 110,
  attackIntervalMs: 1100,
};

export const ARCHER_DEFENDER: DefenderDefinition = {
  id: 'archer',
  name: 'Archer',
  description: 'Fires from a flank post and softens enemies before they reach the gate.',
  role: 'ranged',
  hp: 80,
  damage: 10,
  attackRange: 260,
  attackIntervalMs: 1250,
};

export const REPAIR_WORKER: DefenderDefinition = {
  id: 'repair_worker',
  name: 'Repair Worker',
  description: 'Stays near the objective and repairs damage between attacks.',
  role: 'repair',
  hp: 70,
  damage: 4,
  attackRange: 90,
  attackIntervalMs: 1500,
};

export const HUNTER_DEFENDER: DefenderDefinition = {
  id: 'hunter',
  name: 'Hunter',
  description: 'Fast flank fighter that hits beasts and scouts from short range.',
  role: 'melee',
  hp: 90,
  damage: 15,
  attackRange: 125,
  attackIntervalMs: 900,
};

export const SHIELD_GUARD: DefenderDefinition = {
  id: 'shield_guard',
  name: 'Shield Guard',
  description: 'Tough blocker for roads that need extra time.',
  role: 'tank',
  hp: 180,
  damage: 8,
  attackRange: 95,
  attackIntervalMs: 1200,
};

export const WATER_CARRIER: DefenderDefinition = {
  id: 'water_carrier',
  name: 'Water Carrier',
  description: 'Small heals for the objective and nearby allies.',
  role: 'support',
  hp: 75,
  damage: 3,
  attackRange: 120,
  attackIntervalMs: 1600,
};

export const TORCH_BEARER: DefenderDefinition = {
  id: 'torch_bearer',
  name: 'Torch Bearer',
  description: 'Burns shadow enemies and lights dangerous roads.',
  role: 'anti_shadow',
  hp: 85,
  damage: 11,
  attackRange: 130,
  attackIntervalMs: 1150,
};

export const DEFENDERS: Record<string, DefenderDefinition> = {
  gate_guard: GATE_GUARD,
  archer: ARCHER_DEFENDER,
  repair_worker: REPAIR_WORKER,
  hunter: HUNTER_DEFENDER,
  shield_guard: SHIELD_GUARD,
  water_carrier: WATER_CARRIER,
  torch_bearer: TORCH_BEARER,
};

export const DEFENDER_OPTIONS = Object.values(DEFENDERS);

export function getDefender(id: string): DefenderDefinition | undefined {
  return DEFENDERS[id];
}
