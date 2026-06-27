import { useState } from 'react';
import { POST_GAME_DIALOG, getNgPlusMultiplier, getNgPlusRewardMultiplier, ACHIEVEMENTS } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';
import { DialogSystem } from '@/ui/components/DialogSystem';

export function PostGameScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const startNGPlus = useGameStore((s) => s.startNGPlus);
  const [showDialog, setShowDialog] = useState(true);

  const ngMult = getNgPlusMultiplier(save.ngPlusLevel);
  const rewardMult = getNgPlusRewardMultiplier(save.ngPlusLevel);
  const nextNgGoldBonus = 100 * (save.ngPlusLevel + 1);
  const totalBest = Object.values(save.bestScores).reduce((a, b) => a + b, 0);

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#1a1428] via-[#2a1f3d] to-desert-night text-white">
      {showDialog && (
        <DialogSystem lines={POST_GAME_DIALOG} onComplete={() => setShowDialog(false)} />
      )}

      <div className="relative z-10 max-w-lg text-center px-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-desert-gold/80">Act V Complete</p>
        <h1 className="font-display mb-4 text-4xl font-bold text-desert-gold">Guardian of the Dunes</h1>
        <p className="mb-6 text-white/70">
          The Shadow Emir is defeated. Nahran endures under Malik&apos;s watch. The desert remembers your legend.
        </p>

        <div className="mb-8 rounded-xl border border-desert-gold/30 bg-black/40 p-6 text-sm">
          <p>Campaign complete</p>
          <p className="mt-2 text-desert-gold">NG+ Level: {save.ngPlusLevel}</p>
          <p className="text-white/50">Missions cleared: {save.completedMissions.length}</p>
          <p className="text-white/50">Achievements: {save.achievements.length} / {ACHIEVEMENTS.length}</p>
          <p className="text-white/50">Lore discovered: {save.unlockedLore.length}</p>
          <p className="text-white/50">Combined best scores: {totalBest}</p>
          <p className="text-white/50">Enemy strength multiplier: ×{ngMult.toFixed(2)}</p>
          <p className="text-white/50">Mission reward multiplier: ×{rewardMult.toFixed(2)}</p>
          <p className="mt-3 text-xs text-white/40">
            NG+ resets mission progress and resource nodes. Upgrades, relics, materials, and achievements are kept.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Begin New Game+ ${save.ngPlusLevel + 1}? Mission map resets and enemies grow stronger. You keep upgrades, relics, and materials (+${nextNgGoldBonus} gold).`,
                )
              ) {
                SoundManager.play('click');
                startNGPlus();
                if (!save.achievements.includes('ng_plus_hero')) {
                  window.setTimeout(() => SoundManager.play('unlock'), 300);
                }
              }
            }}
            className="rounded-lg bg-desert-gold px-8 py-3 font-semibold text-desert-night hover:bg-yellow-400"
          >
            Begin New Game+ (+{nextNgGoldBonus} gold)
          </button>
          <button
            type="button"
            onClick={() => { SoundManager.play('click'); setScreen(useGameStore.getState().mapHomeScreen); }}
            className="rounded-lg border border-white/30 px-8 py-3 text-white/80 hover:bg-white/5"
          >
            Continue Exploring
          </button>
          <button
            type="button"
            onClick={() => { SoundManager.play('click'); setScreen('main_menu'); }}
            className="text-sm text-white/40 hover:text-white/70"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
