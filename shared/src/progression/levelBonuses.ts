export function getLevelHpBonus(level: number): number {
  return Math.max(0, level - 1) * 5;
}

export function getLevelDamageBonus(level: number): number {
  return Math.max(0, level - 1) * 2;
}

export function getLevelGoldBonusPct(level: number): number {
  return Math.max(0, level - 1) * 2;
}
