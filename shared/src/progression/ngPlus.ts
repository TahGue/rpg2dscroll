/** Enemy stat multiplier per NG+ cycle */
export function getNgPlusMultiplier(ngPlusLevel: number): number {
  return 1 + Math.max(0, ngPlusLevel) * 0.25;
}

/** Bonus gold/XP multiplier per NG+ cycle */
export function getNgPlusRewardMultiplier(ngPlusLevel: number): number {
  return 1 + Math.max(0, ngPlusLevel) * 0.1;
}
