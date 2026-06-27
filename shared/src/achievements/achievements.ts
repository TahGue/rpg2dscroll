export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_victory', name: 'First Blood', description: 'Win your first defense mission' },
  { id: 'perfect_gate', name: 'Untouched Gate', description: 'Win with the gate at full HP' },
  { id: 'lion_tamer', name: 'Lion Tamer', description: 'Unlock the lion companion' },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat the Dune Scorpion' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Finish a mission under par time' },
  { id: 'centurion', name: 'Desert Centurion', description: 'Reach level 10' },
  { id: 'gold_hoarder', name: 'Gold Hoarder', description: 'Accumulate 500 gold' },
  { id: 'eclipse_guardian', name: 'Eclipse Guardian', description: 'Complete Black Eclipse Gate' },
  { id: 'master_defender', name: 'Master Defender', description: 'Complete all missions' },
  { id: 'sunrise_guardian', name: 'Sunrise Guardian', description: 'Survive until sunrise with the gate untouched' },
  { id: 'oasis_keeper', name: 'Oasis Keeper', description: 'Defend the Silent Oasis with the well at full strength' },
  { id: 'boss_slayer_emir', name: 'Shadow Breaker', description: 'Defeat the Shadow Emir' },
  { id: 'campaign_legend', name: 'Guardian Legend', description: 'Complete the full campaign including Act V' },
  { id: 'resource_hoarder', name: 'Desert Provisioner', description: 'Collect all resource nodes on the map' },
  { id: 'poison_survivor', name: 'Poison Survivor', description: 'Clear Scorpion Nest with the barricade intact' },
  { id: 'ng_plus_hero', name: 'Eternal Guardian', description: 'Start New Game+' },
];

export interface AchievementCheckContext {
  victory: boolean;
  missionId: string;
  gateHpRemaining: number;
  gateMaxHp: number;
  elapsedMs: number;
  parTimeMs: number;
  enemiesKilled: number;
  bossesKilled?: string[];
}

export function checkNewAchievements(
  save: { achievements: string[]; level: number; gold: number; upgrades: Record<string, number>; completedMissions: string[]; collectedResources: string[]; ngPlusLevel: number },
  ctx: AchievementCheckContext,
): string[] {
  const unlocked = new Set(save.achievements);
  const newly: string[] = [];

  const grant = (id: string) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newly.push(id);
    }
  };

  if (ctx.victory) grant('first_victory');
  if (ctx.victory && ctx.gateMaxHp > 0 && ctx.gateHpRemaining >= ctx.gateMaxHp) grant('perfect_gate');
  if (ctx.victory && ctx.missionId === 'mission-night-attack' && ctx.gateMaxHp > 0 && ctx.gateHpRemaining >= ctx.gateMaxHp) {
    grant('sunrise_guardian');
  }
  if (ctx.victory && ctx.missionId === 'mission-silent-oasis' && ctx.gateMaxHp > 0 && ctx.gateHpRemaining >= ctx.gateMaxHp) {
    grant('oasis_keeper');
  }
  if ((save.upgrades.lion_level ?? 0) >= 1) grant('lion_tamer');
  if (ctx.bossesKilled?.includes('dune_scorpion')) grant('boss_slayer');
  if (ctx.victory && ctx.elapsedMs <= ctx.parTimeMs) grant('speed_demon');
  if (save.level >= 10) grant('centurion');
  if (save.gold >= 500) grant('gold_hoarder');
  if (save.completedMissions.includes('mission-black-eclipse') || (ctx.victory && ctx.missionId === 'mission-black-eclipse')) {
    grant('eclipse_guardian');
  }

  if (save.completedMissions.includes('mission-shadow-emir') || (ctx.victory && ctx.missionId === 'mission-shadow-emir')) {
    grant('campaign_legend');
  }
  if (ctx.bossesKilled?.includes('shadow_emir')) grant('boss_slayer_emir');
  if (ctx.victory && ctx.missionId === 'mission-scorpion-nest' && ctx.gateMaxHp > 0 && ctx.gateHpRemaining >= ctx.gateMaxHp) {
    grant('poison_survivor');
  }
  if (save.ngPlusLevel >= 1) grant('ng_plus_hero');

  const allResourceIds = ['hidden-cistern', 'iron-vein', 'leather-cache', 'wood-grove'];
  if (allResourceIds.every((id) => save.collectedResources.includes(id))) grant('resource_hoarder');

  const allMissionIds = [
    'mission-night-attack',
    'mission-silent-oasis',
    'mission-bandit-road',
    'mission-caravan-escort',
    'mission-shrine-sanctum',
    'mission-red-dune-pass',
    'mission-scorpion-nest',
    'mission-broken-watchtower',
    'mission-black-eclipse',
    'mission-shadow-emir',
  ];
  const completed = ctx.victory
    ? [...new Set([...save.completedMissions, ctx.missionId])]
    : save.completedMissions;
  if (allMissionIds.every((id) => completed.includes(id))) grant('master_defender');

  return newly;
}

/** Check achievements driven by save state (no active mission required). */
export function checkMetaAchievements(
  save: Parameters<typeof checkNewAchievements>[0],
): string[] {
  return checkNewAchievements(save, {
    victory: false,
    missionId: '',
    gateHpRemaining: 0,
    gateMaxHp: 0,
    elapsedMs: 0,
    parTimeMs: 0,
    enemiesKilled: 0,
  });
}

export function getParTimeMs(difficulty: number): number {
  return difficulty * 90_000;
}

export function calcSpeedBonus(elapsedMs: number, parTimeMs: number, difficulty: number): number {
  if (elapsedMs > parTimeMs) return 0;
  const ratio = 1 - elapsedMs / parTimeMs;
  return Math.round(25 + ratio * 50 * difficulty);
}
