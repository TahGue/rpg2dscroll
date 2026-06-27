import type { PrepMissionId } from '../missions/missionPrep';

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
  /** Passive: multiply gate/well regen and repair effectiveness. */
  supportHealMult?: number;
  activeCooldownMs: number;
  activeDamage: number;
  activeRange: number;
  /** Active ability heal amount (Yusuf). */
  activeHeal?: number;
  /** Passive: multiply spike trap damage. */
  spikeTrapDamageMult?: number;
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

export const YUSUF: HeroDefinition = {
  id: 'yusuf',
  name: 'Yusuf',
  title: 'Water Guardian',
  region: 'silent-oasis',
  role: 'Healing support',
  passiveDescription: 'Wells and repair restore 20% more HP.',
  activeDescription: 'Heals Malik, the objective, and nearby allies.',
  activeName: 'Healing Spring',
  supportHealMult: 1.2,
  activeCooldownMs: 16000,
  activeDamage: 0,
  activeRange: 180,
  activeHeal: 85,
};

export const HAMZA: HeroDefinition = {
  id: 'hamza',
  name: 'Hamza',
  title: 'Fire Trapper',
  region: 'scorpion-valley',
  role: 'Trap specialist',
  passiveDescription: 'Spike traps deal 25% more damage.',
  activeDescription: 'Scorches enemies in a line ahead with burning oil.',
  activeName: 'Burning Line',
  spikeTrapDamageMult: 1.25,
  activeCooldownMs: 13000,
  activeDamage: 32,
  activeRange: 480,
};

export const HEROES: Record<string, HeroDefinition> = {
  aisha: AISHA,
  yusuf: YUSUF,
  hamza: HAMZA,
};

export const MISSION_HERO_PREFERENCE: Partial<Record<PrepMissionId, string>> = {
  'mission-night-attack': 'aisha',
  'mission-silent-oasis': 'yusuf',
  'mission-scorpion-nest': 'hamza',
};

export function getHero(id: string): HeroDefinition | undefined {
  return HEROES[id];
}

export function isHeroRecruited(recruited: string[], heroId: string): boolean {
  return recruited.includes(heroId);
}

export function getRecruitedHeroes(recruited: string[]): HeroDefinition[] {
  return recruited.map((id) => HEROES[id]).filter(Boolean) as HeroDefinition[];
}

/** Pick the best default hero for a prep mission from recruited roster. */
export function pickDefaultHeroForMission(missionId: string, recruited: string[]): string | null {
  const preferred = MISSION_HERO_PREFERENCE[missionId as PrepMissionId];
  if (preferred && recruited.includes(preferred)) return preferred;
  return recruited[0] ?? null;
}
