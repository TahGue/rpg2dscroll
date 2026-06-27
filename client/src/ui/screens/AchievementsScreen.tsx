import { ACHIEVEMENTS } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function AchievementsScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const unlocked = useGameStore((s) => s.save.achievements);

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); setScreen('main_menu'); }}
          className="text-white/60 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Achievements</h2>
        <span className="text-sm text-desert-gold">{unlocked.length}/{ACHIEVEMENTS.length}</span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-auto p-8 md:grid-cols-2">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-xl border p-4 ${isUnlocked ? 'border-desert-gold/50 bg-desert-gold/5' : 'border-white/10 bg-black/20 opacity-60'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{isUnlocked ? '🏆' : '🔒'}</span>
                <h3 className={`font-semibold ${isUnlocked ? 'text-desert-gold' : 'text-white/50'}`}>{ach.name}</h3>
              </div>
              <p className="mt-1 text-sm text-white/50">{ach.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
