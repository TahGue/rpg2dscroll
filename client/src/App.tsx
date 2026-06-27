import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MainMenu } from '@/ui/screens/MainMenu';
import { WorldExploreView } from '@/ui/screens/WorldExploreView';
import { UpgradeScreen } from '@/ui/screens/UpgradeScreen';
import { InventoryScreen } from '@/ui/screens/InventoryScreen';
import { PostGameScreen } from '@/ui/screens/PostGameScreen';
import { SettingsScreen } from '@/ui/screens/SettingsScreen';
import { LoginScreen } from '@/ui/screens/LoginScreen';
import { LeaderboardScreen } from '@/ui/screens/LeaderboardScreen';
import { AchievementsScreen } from '@/ui/screens/AchievementsScreen';
import { LoreScreen } from '@/ui/screens/LoreScreen';
import { ScreenTransition } from '@/ui/components/ScreenTransition';
import { useMusic } from '@/hooks/useMusic';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const authEmail = useGameStore((s) => s.authEmail);
  const pullCloudSave = useGameStore((s) => s.pullCloudSave);
  const musicMode =
    screen === 'world_map' || screen === 'world_explore'
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
        {screen === 'upgrade' && <UpgradeScreen />}
        {screen === 'inventory' && <InventoryScreen />}
        {screen === 'post_game' && <PostGameScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'login' && <LoginScreen />}
        {screen === 'leaderboard' && <LeaderboardScreen />}
        {screen === 'achievements' && <AchievementsScreen />}
        {screen === 'lore' && <LoreScreen />}
      </ScreenTransition>
    </div>
  );
}
