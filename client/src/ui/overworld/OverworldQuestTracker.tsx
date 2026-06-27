import { getOverworldCampaignProgress, getOverworldQuestHint } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';

export function OverworldQuestTracker() {
  const save = useGameStore((s) => s.save);
  const hint = getOverworldQuestHint(save);
  const progress = getOverworldCampaignProgress(save);

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[11.5rem] rounded-lg border border-white/10 bg-black/65 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:max-w-xs sm:px-4 sm:py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[9px] uppercase tracking-wider text-desert-gold/70">Campaign</p>
        <p className="text-[9px] text-white/45">
          {progress.completedSteps}/{progress.totalSteps}
        </p>
      </div>
      <p className="text-[10px] font-semibold text-desert-gold/90 sm:text-xs">
        {progress.chapterTitle}
        <span className="font-normal text-white/50"> · {progress.chapterSubtitle}</span>
      </p>
      <div className="mb-2 mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-desert-gold/70 to-desert-gold transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mb-0.5 text-[9px] uppercase tracking-wider text-desert-gold/60">Current goal</p>
      <p className="text-[11px] leading-relaxed text-white/85 sm:text-xs">{hint}</p>
    </div>
  );
}
