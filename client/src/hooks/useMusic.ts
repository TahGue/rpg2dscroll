import { useEffect } from 'react';
import { MusicManager } from '@/game/systems/MusicManager';

export function useMusic(mode: 'menu' | 'map' | 'mission' | 'none') {
  useEffect(() => {
    if (mode === 'menu') MusicManager.startMenu();
    else if (mode === 'map') MusicManager.startMap();
    else if (mode === 'mission') MusicManager.startMission();
    else MusicManager.stop();

    return () => MusicManager.stop();
  }, [mode]);
}
