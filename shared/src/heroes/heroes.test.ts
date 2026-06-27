import { describe, expect, it } from 'vitest';
import { pickDefaultHeroForMission } from './heroes';

describe('pickDefaultHeroForMission', () => {
  it('prefers Aisha for Night Attack', () => {
    expect(pickDefaultHeroForMission('mission-night-attack', ['aisha', 'yusuf'])).toBe('aisha');
  });

  it('prefers Yusuf for Silent Oasis', () => {
    expect(pickDefaultHeroForMission('mission-silent-oasis', ['aisha', 'yusuf'])).toBe('yusuf');
  });

  it('prefers Hamza for Scorpion Nest', () => {
    expect(pickDefaultHeroForMission('mission-scorpion-nest', ['aisha', 'hamza'])).toBe('hamza');
  });

  it('prefers Aisha for Black Eclipse', () => {
    expect(pickDefaultHeroForMission('mission-black-eclipse', ['aisha', 'hamza'])).toBe('aisha');
  });

  it('prefers Salim for Shadow Emir finale', () => {
    expect(pickDefaultHeroForMission('mission-shadow-emir', ['aisha', 'salim'])).toBe('salim');
  });

  it('falls back to first recruited hero', () => {
    expect(pickDefaultHeroForMission('mission-silent-oasis', ['aisha'])).toBe('aisha');
  });
});
