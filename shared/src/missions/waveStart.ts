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
    return 'Explore left and right from the gate — gather, repair, build — then ring the war bell.';
  }
  return 'Walk the battlefield — repair and rebuild both flanks, then sound the horn for the next wave.';
}
