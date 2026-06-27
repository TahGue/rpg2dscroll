import { useGameStore } from '@/store/gameStore';
import { DEMO_QUESTS, getActiveQuestHint, getQuestObjectiveProgress } from '@malik/shared';

export function OverworldQuestTracker() {
  const save = useGameStore((s) => s.save);
  const active = DEMO_QUESTS.filter((quest) => save.quests[quest.id]?.started && !save.quests[quest.id]?.completed);
  const completed = DEMO_QUESTS.filter((quest) => save.completedQuests.includes(quest.id));
  const hint = getActiveQuestHint(save.quests);

  return (
    <div className="pointer-events-none max-w-sm rounded-xl border border-desert-gold/30 bg-black/55 p-4 text-white shadow-2xl backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.25em] text-desert-gold/70">Quest Log</p>
      <h3 className="mt-1 font-display text-lg text-desert-gold">The Drying Well</h3>
      <p className="mt-1 text-xs text-white/60">{hint}</p>

      <div className="mt-3 space-y-3">
        {active.slice(0, 2).map((quest) => {
          const progress = save.quests[quest.id];
          return (
            <div key={quest.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold">{quest.title}</p>
              <div className="mt-2 space-y-1">
                {quest.objectives.map((objective) => {
                  const current = getQuestObjectiveProgress(progress, objective.id);
                  const done = current >= objective.target;
                  return (
                    <p key={objective.id} className={`text-[11px] ${done ? 'text-emerald-300' : 'text-white/55'}`}>
                      {done ? '[x]' : '-'} {objective.label} ({current}/{objective.target})
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
        {active.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/50">
            Talk to the Village Elder to begin Malik's adventure.
          </p>
        )}
      </div>

      <p className="mt-3 text-[10px] text-white/40">
        Completed {completed.length}/{DEMO_QUESTS.length} quests · Nahran reputation {save.reputation.nahran ?? 0}
      </p>
    </div>
  );
}
