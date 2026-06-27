import { RELIC_UPGRADES, isRelicUnlocked } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function RelicUpgradesScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const purchaseRelic = useGameStore((s) => s.purchaseRelic);

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button type="button" onClick={() => { SoundManager.play('click'); setScreen('world_map'); }} className="text-white/60 hover:text-white">
          ← Back
        </button>
        <h2 className="font-display text-2xl text-purple-300">Sentinel Relics</h2>
        <span className="text-sm text-white/60">{save.gold}g · {save.water} water · {save.inventory.relic_shard ?? 0} shards</span>
      </header>

      <p className="px-8 pb-2 text-sm text-white/50">
        Relic Shards reduce water cost by 1 when upgrading relics.
      </p>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-8 md:grid-cols-2">
        {RELIC_UPGRADES.map((relic) => {
          const unlocked = isRelicUnlocked(relic.id, save.completedMissions);
          const level = save.relicLevels[relic.id] ?? 0;
          const maxed = level >= relic.maxLevel;
          const canAfford = save.gold >= relic.goldCost && save.water >= relic.waterCost;

          return (
            <div
              key={relic.id}
              className={`rounded-xl border p-5 ${
                unlocked ? 'border-purple-400/40 bg-black/30' : 'border-white/10 bg-black/20 opacity-60'
              }`}
            >
              <h3 className="font-semibold text-purple-200">{relic.name}</h3>
              <p className="mt-1 text-sm text-white/60">{relic.description}</p>
              {!unlocked && (
                <p className="mt-2 text-xs text-red-300">
                  Complete {relic.unlockRequirement?.replace('mission-', '').replace(/-/g, ' ')} to unlock
                </p>
              )}
              {unlocked && (
                <>
                  <p className="mt-3 text-sm">
                    Level <span className="font-bold">{level}</span> / {relic.maxLevel}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {relic.goldCost}g · {relic.waterCost} water
                  </p>
                  <button
                    type="button"
                    disabled={maxed || !canAfford}
                    onClick={() => { if (purchaseRelic(relic.id)) SoundManager.play('click'); }}
                    className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
                  >
                    {maxed ? 'Max Level' : level === 0 ? 'Unlock' : 'Upgrade'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
