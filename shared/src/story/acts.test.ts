import { describe, expect, it } from 'vitest';
import { getActBannerAfterVictory } from './acts';

describe('getActBannerAfterVictory', () => {
  it('returns act-2 after night attack when act-2 unseen', () => {
    expect(getActBannerAfterVictory('mission-night-attack', ['act-1'])).toBe('act-2');
  });

  it('returns act-3 after scorpion nest for overworld valley path', () => {
    expect(getActBannerAfterVictory('mission-scorpion-nest', ['act-1', 'act-2'])).toBe('act-3');
  });

  it('returns act-4 after shrine sanctum when act-4 unseen', () => {
    expect(getActBannerAfterVictory('mission-shrine-sanctum', ['act-1', 'act-2', 'act-3'])).toBe('act-4');
  });

  it('skips banners already seen', () => {
    expect(getActBannerAfterVictory('mission-black-eclipse', ['act-5'])).toBeNull();
  });

  it('does not duplicate act-5 after shadow emir if already seen', () => {
    expect(getActBannerAfterVictory('mission-shadow-emir', ['act-5'])).toBeNull();
  });
});
