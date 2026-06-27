export function calculateMissionScore(params: {
  victory: boolean;
  gateHpRemaining: number;
  gateMaxHp: number;
  enemiesKilled: number;
  goldEarned: number;
  difficulty: number;
}): number {
  if (!params.victory) {
    return params.enemiesKilled * 10 + params.goldEarned;
  }

  const gatePct = params.gateMaxHp > 0 ? params.gateHpRemaining / params.gateMaxHp : 0;
  const gatePoints = Math.round(gatePct * 500);
  const killPoints = params.enemiesKilled * 25;
  const goldPoints = params.goldEarned;
  const difficultyBonus = params.difficulty * 100;

  return gatePoints + killPoints + goldPoints + difficultyBonus;
}
