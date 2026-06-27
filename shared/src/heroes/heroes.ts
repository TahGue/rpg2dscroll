export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  region: string;
  role: string;
  passiveDescription: string;
  activeDescription: string;
  activeName: string;
  /** Passive: arrow towers fire this much faster (multiplier on fireRateMs). */
  arrowTowerFireRateMult?: number;
  activeCooldownMs: number;
  activeDamage: number;
  activeRange: number;
}

export const AISHA: HeroDefinition = {
  id: 'aisha',
  name: 'Aisha',
  title: 'Desert Archer',
  region: 'nahran-outskirts',
  role: 'Ranged support',
  passiveDescription: 'Arrow towers shoot 15% faster.',
  activeDescription: 'Damages all enemies in a long line ahead.',
  activeName: 'Arrow Rain',
  arrowTowerFireRateMult: 0.85,
  activeCooldownMs: 14000,
  activeDamage: 28,
  activeRange: 520,
};

export const HEROES: Record<string, HeroDefinition> = {
  aisha: AISHA,
};

export function getHero(id: string): HeroDefinition | undefined {
  return HEROES[id];
}

export function isHeroRecruited(recruited: string[], heroId: string): boolean {
  return recruited.includes(heroId);
}
