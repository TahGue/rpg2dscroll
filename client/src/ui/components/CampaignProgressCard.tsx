import {
  getOverworldCampaignProgress,
  getOverworldQuestHint,
  type LocalSaveData,
} from '@malik/shared';

type CampaignSave = Pick<
  LocalSaveData,
  | 'completedMissions'
  | 'recruitedHeroes'
  | 'unlockedBlueprints'
  | 'visitedOverworldRegions'
  | 'campaignComplete'
>;

interface CampaignProgressCardProps {
  save: CampaignSave;
  variant?: 'overlay' | 'inline';
  showGoal?: boolean;
}

export function CampaignProgressCard({
  save,
  variant = 'overlay',
  showGoal = true,
}: CampaignProgressCardProps) {
  const progress = getOverworldCampaignProgress(save);
  const hint = showGoal ? getOverworldQuestHint(save) : null;

  const wrapperClass =
    variant === 'overlay'
      ? 'pointer-events-none absolute left-3 top-3 z-10 max-w-[11.5rem] rounded-lg border border-white/10 bg-black/65 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:max-w-xs sm:px-4 sm:py-3'
      : 'rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 sm:px-4 sm:py-3';

  return (
    <div className={wrapperClass}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[9px] uppercase tracking-wider text-desert-gold/70 sm:text-[10px]">Campaign</p>
        <p className="text-[9px] text-white/45 sm:text-[10px]">
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
      {hint && (
        <>
          <p className="mb-0.5 text-[9px] uppercase tracking-wider text-desert-gold/60 sm:text-[10px]">
            Current goal
          </p>
          <p className="text-[11px] leading-relaxed text-white/85 sm:text-xs">{hint}</p>
        </>
      )}
    </div>
  );
}
