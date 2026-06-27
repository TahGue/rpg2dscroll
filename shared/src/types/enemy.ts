export type EnemyBehavior = 'melee' | 'ranged' | 'flying' | 'boss';

export interface EnemyDefinition {
  id: string;
  name: string;
  behavior: EnemyBehavior;
  health: number;
  damage: number;
  speed: number;
  attackRange: number;
  attackCooldownMs: number;
  goldDrop: number;
  xpDrop: number;
  targetsGate: boolean;
  isBoss?: boolean;
  /** Flat damage reduction 0–0.75 */
  armor?: number;
  /** Poison damage per second applied to Malik on melee hit */
  poisonDps?: number;
}
