import { LORE_ENTRIES, getLoreById } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

const CATEGORY_LABELS: Record<string, string> = {
  history: 'History',
  legend: 'Legend',
  enemy: 'Bestiary',
  region: 'Regions',
};

export function LoreScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const unlocked = useGameStore((s) => s.save.unlockedLore);

  const entries = LORE_ENTRIES.map((entry) => ({
    ...entry,
    isUnlocked: unlocked.includes(entry.id),
  }));

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
        <h2 className="font-display text-2xl text-desert-gold">Desert Lore</h2>
        <span className="text-sm text-desert-gold">{unlocked.length}/{LORE_ENTRIES.length}</span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-auto p-8 md:grid-cols-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className={`rounded-xl border p-4 ${entry.isUnlocked ? 'border-desert-gold/40 bg-desert-gold/5' : 'border-white/10 bg-black/20 opacity-60'}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className={`font-semibold ${entry.isUnlocked ? 'text-desert-gold' : 'text-white/50'}`}>
                {entry.isUnlocked ? entry.title : '???'}
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                {entry.isUnlocked ? CATEGORY_LABELS[entry.category] : 'Locked'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {entry.isUnlocked ? entry.body : 'Complete missions and visit lore locations to discover this entry.'}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function LoreDiscoveryModal({ loreId, onClose }: { loreId: string; onClose: () => void }) {
  const entry = getLoreById(loreId);

  if (!entry) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-desert-gold/40 bg-desert-night p-8 text-white shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-widest text-desert-ember">Lore Discovered</p>
        <h3 className="font-display mb-4 text-2xl text-desert-gold">{entry.title}</h3>
        <p className="mb-6 leading-relaxed text-white/70">{entry.body}</p>
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); onClose(); }}
          className="w-full rounded-lg bg-desert-gold py-3 font-semibold text-desert-night"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
