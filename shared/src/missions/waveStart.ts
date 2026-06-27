export interface WaveStartLabelContext {
  currentWave: number;
  totalWaves: number;
  isAmbush: boolean;
  betweenWaves: boolean;
}

/** Label for the manual wave-start control (HUD / horn). */
export function getWaveStartLabel(ctx: WaveStartLabelContext): string {
  if (ctx.isAmbush) return 'Engage!';
  if (ctx.currentWave === 0) return 'Ring the War Bell';
  const nextWave = ctx.currentWave + 1;
  if (nextWave >= ctx.totalWaves && ctx.totalWaves > 0) return 'Begin Final Wave';
  if (ctx.betweenWaves && nextWave > 0) return `Begin Wave ${nextWave}`;
  return 'Sound the Horn';
}

export function getWaveStartHint(ctx: WaveStartLabelContext): string {
  if (ctx.isAmbush) return 'Ambush — enemies approach!';
  if (ctx.currentWave === 0) {
    return 'The enemy is coming. Explore routes, build, repair — start when ready.';
  }
  return 'Rebuild and upgrade — sound the horn when ready for the next wave.';
}
