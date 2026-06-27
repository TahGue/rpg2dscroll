export interface DefenderDefinition {
  id: string;
  name: string;
  description: string;
  hp: number;
  damage: number;
  attackRange: number;
  attackIntervalMs: number;
}

export const GATE_GUARD: DefenderDefinition = {
  id: 'gate_guard',
  name: 'Gate Guard',
  description: 'Holds the line near the gate and strikes nearby raiders.',
  hp: 120,
  damage: 12,
  attackRange: 110,
  attackIntervalMs: 1100,
};

export const DEFENDERS: Record<string, DefenderDefinition> = {
  gate_guard: GATE_GUARD,
};

export function getDefender(id: string): DefenderDefinition | undefined {
  return DEFENDERS[id];
}
