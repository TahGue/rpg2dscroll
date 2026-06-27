import { describe, expect, it } from 'vitest';
import { getWaveStartHint, getWaveStartLabel } from './waveStart';

describe('getWaveStartLabel', () => {
  it('uses war bell before wave 1', () => {
    expect(
      getWaveStartLabel({ currentWave: 0, totalWaves: 3, isAmbush: false, betweenWaves: false }),
    ).toBe('Ring the War Bell');
  });

  it('labels the final wave', () => {
    expect(
      getWaveStartLabel({ currentWave: 2, totalWaves: 3, isAmbush: false, betweenWaves: true }),
    ).toBe('Begin Final Wave');
  });

  it('labels mid-campaign waves', () => {
    expect(
      getWaveStartLabel({ currentWave: 1, totalWaves: 4, isAmbush: false, betweenWaves: true }),
    ).toBe('Begin Wave 2');
  });

  it('uses engage for ambush', () => {
    expect(
      getWaveStartLabel({ currentWave: 0, totalWaves: 2, isAmbush: true, betweenWaves: false }),
    ).toBe('Engage!');
  });
});

describe('getWaveStartHint', () => {
  it('describes unlimited prep before wave 1', () => {
    expect(
      getWaveStartHint({ currentWave: 0, totalWaves: 3, isAmbush: false, betweenWaves: false }),
    ).toContain('war bell');
  });
});
