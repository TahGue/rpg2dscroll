import { useEffect } from 'react';
import { ACHIEVEMENTS, getCampaignNextGoal, getInventoryItem, getLocationDisplayName, getCurrentMapNodeId } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';
import { ActBannerModal } from '@/ui/components/ActBannerModal';

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MissionResultScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const queueMissionStart = useGameStore((s) => s.queueMissionStart);
  const missionReturnScreen = useGameStore((s) => s.missionReturnScreen);
  const refreshOverworldAfterMission = useGameStore((s) => s.refreshOverworldAfterMission);
  const pendingActBanner = useGameStore((s) => s.pendingActBanner);
  const dismissActBanner = useGameStore((s) => s.dismissActBanner);
  const save = useGameStore((s) => s.save);
  const result = useGameStore((s) => s.lastMissionResult);

  useEffect(() => {
    if (!result) return;
    if (result.victory) SoundManager.play('victory');
    else SoundManager.play('defeat');
    if (result.newAchievements.length > 0) {
      window.setTimeout(() => SoundManager.play('unlock'), 400);
    }
  }, [result?.missionId, result?.victory, result?.newAchievements.length]);

  if (!result) {
    setScreen(missionReturnScreen);
    return null;
  }

  const nextGoal =
    result.victory && !result.campaignJustCompleted
      ? getCampaignNextGoal(save, missionReturnScreen)
      : null;

  return (
    <div className="relative flex h-full items-center justify-center bg-desert-night/95">
      <div className="w-full max-w-md rounded-2xl border border-desert-gold/40 bg-black/60 p-8 text-center text-white">
        <h2 className={`font-display mb-4 text-4xl ${result.victory ? 'text-desert-gold' : 'text-red-400'}`}>
          {result.victory ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="mb-6 text-white/60">
          {result.victory
            ? result.missionId === 'mission-shadow-emir'
              ? 'The Shadow Emir falls. The eclipse lifts — Nahran endures.'
              : result.missionId === 'mission-black-eclipse'
                ? 'The Black Eclipse breaks against the gate. The fortress of the Emir awaits.'
                : result.missionId === 'mission-broken-watchtower'
                  ? 'The dune scorpion lies broken. Ancient stones whisper of the Sentinels.'
                  : result.isAmbush
              ? 'The ambush is broken. The desert road is clear.'
              : result.isCaravan
                ? 'The caravan reaches safe dunes. The merchants owe Malik their lives.'
                : result.isSurvive
                  ? 'The sun rises over Nahran. The gate holds and the night raid is broken.'
                  : result.isOasis
                    ? 'The oasis well runs clear. Caravans will drink from these waters again.'
                    : result.isShrine
                    ? 'The sacred shrine stands. The First Sentinels would be proud.'
                    : 'The gate holds. The desert sleeps tonight.'
            : result.isAmbush
              ? 'Malik has fallen. The raiders overrun the road.'
              : result.isCaravan
                ? 'The caravan is lost. Bandits claim the trade route.'
                : result.isSurvive
                  ? 'Darkness claims the gate before dawn. Nahran stirs to ruin.'
                  : result.isOasis
                    ? 'The well is poisoned and broken. The desert grows thirstier.'
                    : result.isShrine
                    ? 'The shrine has fallen. Ancient stones lie broken in the sand.'
                    : 'The gate has fallen. Try again, warrior.'}
        </p>

        <div className="mb-8 space-y-2 text-left text-sm">
          <StatRow label="Gold earned" value={`+${result.goldEarned}`} />
          {result.waterEarned > 0 && (
            <StatRow label="Water earned" value={`+${result.waterEarned}`} />
          )}
          {result.speedBonusGold > 0 && (
            <StatRow label="Speed bonus" value={`+${result.speedBonusGold}`} />
          )}
          {result.ngPlusBonusGold > 0 && (
            <StatRow label="NG+ reward bonus" value={`+${result.ngPlusBonusGold}`} />
          )}
          {Object.keys(result.inventoryEarned).length > 0 && (
            <div className="border-b border-white/10 py-2">
              <p className="text-white/50 text-sm mb-1">Supplies found</p>
              {Object.entries(result.inventoryEarned).map(([id, qty]) => {
                const item = getInventoryItem(id);
                return (
                  <p key={id} className="text-xs text-teal-300">
                    +{qty} {item?.name ?? id}
                  </p>
                );
              })}
            </div>
          )}
          <StatRow label="Time" value={formatTime(result.elapsedMs)} />
          <StatRow label="XP earned" value={`+${result.xpEarned}`} />
          {result.ngPlusBonusXp > 0 && (
            <StatRow label="NG+ XP bonus" value={`+${result.ngPlusBonusXp}`} />
          )}
          {result.levelsGained > 0 && (
            <StatRow label="Level up!" value={`+${result.levelsGained} level${result.levelsGained > 1 ? 's' : ''}`} />
          )}
          <StatRow label="Enemies killed" value={String(result.enemiesKilled)} />
          <StatRow label="Score" value={String(result.score)} />
          {result.isNewBest && (
            <p className="text-center text-sm text-desert-gold">New personal best!</p>
          )}
          {!result.isAmbush && (
            <StatRow
              label={
                result.isCaravan
                  ? 'Caravan HP remaining'
                  : result.isOasis
                    ? 'Well HP remaining'
                    : result.isShrine
                      ? 'Shrine HP remaining'
                      : 'Gate HP remaining'
              }
              value={String(Math.round(result.gateHpRemaining))}
            />
          )}
        </div>

        {result.newAchievements.length > 0 && (
          <div className="mb-6 rounded-lg border border-desert-gold/30 bg-desert-gold/5 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-desert-gold">Achievements Unlocked!</p>
            {result.newAchievements.map((id) => {
              const ach = ACHIEVEMENTS.find((a) => a.id === id);
              return ach ? (
                <p key={id} className="text-xs text-white/70">🏆 {ach.name} — {ach.description}</p>
              ) : null;
            })}
          </div>
        )}

        {result.victory && result.unlockedLocationIds.length > 0 && (
          <div className="mb-6 rounded-lg border border-teal-400/30 bg-teal-950/20 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-teal-300">New locations on the map</p>
            {result.unlockedLocationIds.map((id) => (
              <p key={id} className="text-xs text-white/70">🗺️ {getLocationDisplayName(id)}</p>
            ))}
          </div>
        )}

        {nextGoal && !pendingActBanner && (
          <div className="mb-6 rounded-lg border border-desert-gold/25 bg-desert-gold/5 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-desert-gold">Next</p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{nextGoal}</p>
          </div>
        )}

        <div className="flex gap-3">
          {result.victory ? (
            <>
              {result.campaignJustCompleted ? (
                <ActionButton onClick={() => setScreen('post_game')}>Epilogue</ActionButton>
              ) : (
                <ActionButton
                  onClick={() => {
                    SoundManager.play('click');
                    if (missionReturnScreen === 'world_explore') {
                      refreshOverworldAfterMission();
                      setScreen('world_explore');
                    } else {
                      const save = useGameStore.getState().save;
                      useGameStore.setState({
                        screen: 'world_map',
                        mapFocusLocationId: getCurrentMapNodeId(save),
                        mapUnlockAnnouncement:
                          result.unlockedLocationIds.length > 0 ? result.unlockedLocationIds : null,
                      });
                    }
                  }}
                >
                  {missionReturnScreen === 'world_explore' ? 'Return to Desert' : 'Continue to Map'}
                </ActionButton>
              )}
            </>
          ) : (
            <>
              <ActionButton onClick={() => setScreen(missionReturnScreen)} variant="secondary">
                {missionReturnScreen === 'world_explore' ? 'Desert' : 'Map'}
              </ActionButton>
              <ActionButton
                onClick={() => result.missionId && queueMissionStart(result.missionId, missionReturnScreen)}
              >
                Retry
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {result.victory && pendingActBanner && (
        <ActBannerModal actId={pendingActBanner} onDismiss={dismissActBanner} />
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-2">
      <span className="text-white/50">{label}</span>
      <span className="font-semibold text-desert-gold">{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const styles =
    variant === 'primary'
      ? 'flex-1 bg-desert-gold text-desert-night'
      : 'flex-1 border border-white/30 text-white/80';

  return (
    <button type="button" onClick={onClick} className={`rounded-lg py-3 font-semibold ${styles}`}>
      {children}
    </button>
  );
}
