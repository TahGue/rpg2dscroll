import type { WideBattlefieldConfig } from './wideBattlefield';

export type BattlePost = 'gate' | 'left' | 'right';

export type DefenderPost = BattlePost | 'none';

export const BATTLE_POST_LABELS: Record<BattlePost, string> = {
  gate: 'Gate',
  left: 'Left flank',
  right: 'Right flank',
};

export const DEFENDER_POST_LABELS: Record<DefenderPost, string> = {
  none: 'Unassigned',
  gate: 'Gate',
  left: 'Left flank',
  right: 'Right flank',
};

const BATTLE_POSTS: BattlePost[] = ['gate', 'left', 'right'];
const DEFENDER_POSTS: DefenderPost[] = ['none', 'gate', 'left', 'right'];

export function isBattlePost(value: string | undefined): value is BattlePost {
  return value !== undefined && BATTLE_POSTS.includes(value as BattlePost);
}

export function isDefenderPost(value: string | undefined): value is DefenderPost {
  return value !== undefined && DEFENDER_POSTS.includes(value as DefenderPost);
}

/** World X ratio for a hero or defender anchor on wide battlefields. */
export function getBattlePostAnchorRatio(post: BattlePost, wide?: WideBattlefieldConfig): number {
  if (!wide || post === 'gate') return 0.5;
  if (post === 'left') {
    const ratios = wide.leftSocketRatios;
    return ratios[Math.floor(ratios.length / 2)] ?? 0.2;
  }
  const ratios = wide.rightSocketRatios;
  return ratios[Math.floor(ratios.length / 2)] ?? 0.8;
}
