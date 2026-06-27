import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameManager } from '@/game/GameManager';
import { MissionHUD } from '@/ui/hud/MissionHUD';
import { TouchControls } from '@/ui/hud/TouchControls';
import { InputBridge } from '@/game/systems/InputBridge';
import { MissionControlBridge } from '@/game/systems/MissionControlBridge';

export function MissionView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameManager | null>(null);
  const missionId = useGameStore((s) => s.mission.missionId);
  const isPaused = useGameStore((s) => s.mission.isPaused);
  const abortMission = useGameStore((s) => s.abortMission);

  useEffect(() => {
    if (!containerRef.current || !missionId) return;

    const manager = new GameManager(containerRef.current, missionId);
    gameRef.current = manager;
    manager.start();

    return () => {
      manager.destroy();
      gameRef.current = null;
      InputBridge.reset();
      MissionControlBridge.reset();
    };
  }, [missionId]);

  useEffect(() => {
    if (!gameRef.current) return;
    if (isPaused) gameRef.current.pause();
    else gameRef.current.resume();
  }, [isPaused]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <MissionHUD
        onExit={() => {
          if (window.confirm('Leave the mission? Progress is lost and any mission boost is refunded.')) {
            abortMission();
          }
        }}
      />
      <TouchControls />
    </div>
  );
}
