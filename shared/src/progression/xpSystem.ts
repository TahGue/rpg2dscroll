export function xpRequiredForLevel(level: number): number {
  return level * 100;
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpRequiredForLevel(i);
  }
  return total;
}

export interface XpGainResult {
  xp: number;
  level: number;
  levelsGained: number;
}

export function applyXpGain(currentXp: number, currentLevel: number, gained: number): XpGainResult {
  let xp = currentXp + gained;
  let level = currentLevel;
  let levelsGained = 0;

  while (level < 50) {
    const needed = xpRequiredForLevel(level);
    if (xp < needed) break;
    xp -= needed;
    level++;
    levelsGained++;
  }

  return { xp, level, levelsGained };
}

export function getXpProgress(currentXp: number, currentLevel: number): { current: number; needed: number; pct: number } {
  const needed = xpRequiredForLevel(currentLevel);
  return {
    current: currentXp,
    needed,
    pct: Math.min(100, (currentXp / needed) * 100),
  };
}
