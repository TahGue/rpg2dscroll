import { getOverworldQuestHint } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';

export function OverworldQuestTracker() {
  const save = useGameStore((s) => s.save);
  const hint = getOverworldQuestHint(save);

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-xs rounded-lg border border-white/10 bg-black/65 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[9px] uppercase tracking-wider text-desert-gold/70">Current goal</p>
      <p className="text-xs leading-relaxed text-white/85">{hint}</p>
    </div>
  );
}
