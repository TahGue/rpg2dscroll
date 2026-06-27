import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MainMenu } from '@/ui/screens/MainMenu';
import { WorldMap } from '@/ui/screens/WorldMap';
import { WorldExploreView } from '@/ui/screens/WorldExploreView';
import { UpgradeScreen } from '@/ui/screens/UpgradeScreen';
import { CampUpgradesScreen } from '@/ui/screens/CampUpgradesScreen';
import { RelicUpgradesScreen } from '@/ui/screens/RelicUpgradesScreen';
import { InventoryScreen } from '@/ui/screens/InventoryScreen';
import { PostGameScreen } from '@/ui/screens/PostGameScreen';
import { MissionResultScreen } from '@/ui/screens/MissionResultScreen';
import { MissionView } from '@/ui/screens/MissionView';
import { MissionPrepScreen } from '@/ui/screens/MissionPrepScreen';
import { DefenseSkillsScreen } from '@/ui/screens/DefenseSkillsScreen';
import { SettingsScreen } from '@/ui/screens/SettingsScreen';
import { LoginScreen } from '@/ui/screens/LoginScreen';
import { LeaderboardScreen } from '@/ui/screens/LeaderboardScreen';
import { AchievementsScreen } from '@/ui/screens/AchievementsScreen';
import { LoreScreen } from '@/ui/screens/LoreScreen';
import { ScreenTransition } from '@/ui/components/ScreenTransition';
import { useMusic } from '@/hooks/useMusic';
import { SoundManager } from '@/game/systems/SoundManager';

function MissionPrepRoute() {
  const prepMissionId = useGameStore((s) => s.prepMissionId);
  const missionReturnScreen = useGameStore((s) => s.missionReturnScreen);
  const setScreen = useGameStore((s) => s.setScreen);

  if (!prepMissionId) return null;

  return (
    <MissionPrepScreen
      missionId={prepMissionId}
      onBack={() => {
        SoundManager.play('click');
        useGameStore.setState({ prepMissionId: null });
        setScreen(missionReturnScreen);
      }}
    />
  );
}

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const authEmail = useGameStore((s) => s.authEmail);
  const pullCloudSave = useGameStore((s) => s.pullCloudSave);
  const musicMode =
    screen === 'mission' || screen === 'mission_prep'
      ? 'mission'
      : screen === 'world_map' || screen === 'world_explore'
        ? 'map'
        : screen === 'main_menu'
          ? 'menu'
          : 'none';
  useMusic(musicMode);

  useEffect(() => {
    if (authEmail) void pullCloudSave();
  }, [authEmail, pullCloudSave]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ScreenTransition screen={screen}>
        {screen === 'main_menu' && <MainMenu />}
        {screen === 'world_explore' && <WorldExploreView />}
        {screen === 'world_map' && <WorldMap />}
        {screen === 'upgrade' && <UpgradeScreen />}
        {screen === 'camp_upgrades' && <CampUpgradesScreen />}
        {screen === 'relic_upgrades' && <RelicUpgradesScreen />}
        {screen === 'inventory' && <InventoryScreen />}
        {screen === 'post_game' && <PostGameScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'login' && <LoginScreen />}
        {screen === 'leaderboard' && <LeaderboardScreen />}
        {screen === 'achievements' && <AchievementsScreen />}
        {screen === 'lore' && <LoreScreen />}
        {screen === 'mission_result' && <MissionResultScreen />}
        {screen === 'defense_skills' && <DefenseSkillsScreen />}
        {screen === 'mission_prep' && <MissionPrepRoute />}
        {screen === 'mission' && <MissionView />}
      </ScreenTransition>
    </div>
  );
}
