export interface OverworldRegionIntro {
  regionId: string;
  title: string;
  subtitle: string;
  description: string;
}

export const OVERWORLD_REGION_INTROS: Record<string, OverworldRegionIntro> = {
  'scorpion-valley': {
    regionId: 'scorpion-valley',
    title: 'Scorpion Valley',
    subtitle: 'Region II — Canyon of Venom',
    description:
      'Rocky passes choke the wind. Poison pools shimmer below while scorpions nest in the dark. Hamza\'s trappers hold Valley Camp — the Sentinel Road and Broken Watchtower lie east.',
  },
  'black-eclipse-rim': {
    regionId: 'black-eclipse-rim',
    title: 'Black Eclipse Rim',
    subtitle: 'Region III — Sunless Horizon',
    description:
      'The sky bruises purple over iron dunes. Vanguard wraiths drift through the shadow as the Black Eclipse Gate and the Shadow Emir\'s fortress await beyond Eclipse Outpost.',
  },
};

export function getOverworldRegionIntro(regionId: string): OverworldRegionIntro | undefined {
  return OVERWORLD_REGION_INTROS[regionId];
}

export function shouldShowOverworldRegionIntro(
  regionId: string,
  visitedOverworldRegions: string[],
): boolean {
  if (!getOverworldRegionIntro(regionId)) return false;
  return !visitedOverworldRegions.includes(regionId);
}
