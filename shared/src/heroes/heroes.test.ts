import { describe, expect, it } from 'vitest';
import { pickDefaultHeroForMission } from './heroes';

describe('pickDefaultHeroForMission', () => {
  it('prefers Aisha for Night Attack', () => {
    expect(pickDefaultHeroForMission('mission-night-attack', ['aisha', 'yusuf'])).toBe('aisha');
  });

  it('prefers Yusuf for Silent Oasis', () => {
    expect(pickDefaultHeroForMission('mission-silent-oasis', ['aisha', 'yusuf'])).toBe('yusuf');
  });

  it('falls back to first recruited hero', () => {
    expect(pickDefaultHeroForMission('mission-silent-oasis', ['aisha'])).toBe('aisha');
  });
});
