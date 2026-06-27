import { MISSION_UNLOCKS } from './unlockMap';

export function applyMissionUnlocks(
  completedMissions: string[],
  unlockedMissions: string[],
  missionId: string,
): string[] {
  const unlocked = [...unlockedMissions];

  for (const [completed, locations] of Object.entries(MISSION_UNLOCKS)) {
    if (missionId === completed || completedMissions.includes(completed)) {
      for (const loc of locations) {
        if (!unlocked.includes(loc)) unlocked.push(loc);
      }
    }
  }

  return unlocked;
}
