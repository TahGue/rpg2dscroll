import { describe, expect, it } from 'vitest';
import { getBattlePostAnchorRatio, isBattlePost, isDefenderPost } from './battlePosts';
import { NIGHT_ATTACK_WIDE } from './wideBattlefield';

describe('battlePosts', () => {
  it('anchors flank posts to middle build sockets', () => {
    expect(getBattlePostAnchorRatio('gate', NIGHT_ATTACK_WIDE)).toBe(0.5);
    expect(getBattlePostAnchorRatio('left', NIGHT_ATTACK_WIDE)).toBe(0.26);
    expect(getBattlePostAnchorRatio('right', NIGHT_ATTACK_WIDE)).toBe(0.74);
  });

  it('defaults to gate when no wide layout', () => {
    expect(getBattlePostAnchorRatio('left')).toBe(0.5);
  });

  it('validates post values', () => {
    expect(isBattlePost('left')).toBe(true);
    expect(isBattlePost('roam')).toBe(false);
    expect(isDefenderPost('none')).toBe(true);
    expect(isDefenderPost('gate')).toBe(true);
  });
});
