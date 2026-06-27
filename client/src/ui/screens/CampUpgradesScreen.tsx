import { CAMP_UPGRADES } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function CampUpgradesScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const purchaseCampUpgrade = useGameStore((s) => s.purchaseCampUpgrade);

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button type="button" onClick={() => { SoundManager.play('click'); setScreen('world_map'); }} className="text-white/60 hover:text-white">
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Camp Upgrades</h2>
        <span className="text-xs text-white/60">
          {save.gold}g · {save.water}w · {save.iron} iron · {save.leather} leather · {save.wood} wood
        </span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-8 md:grid-cols-2">
        {CAMP_UPGRADES.map((upgrade) => {
          const level = save.campUpgrades[upgrade.id] ?? 0;
          const maxed = level >= upgrade.maxLevel;
          const canAfford =
            save.gold >= upgrade.goldCost &&
            save.water >= upgrade.waterCost &&
            save.iron >= upgrade.ironCost &&
            save.leather >= upgrade.leatherCost &&
            save.wood >= upgrade.woodCost;

          return (
            <div key={upgrade.id} className="rounded-xl border border-desert-gold/30 bg-black/30 p-5">
              <h3 className="font-semibold text-desert-gold">{upgrade.name}</h3>
              <p className="mt-1 text-sm text-white/60">{upgrade.description}</p>
              <p className="mt-3 text-sm">
                Level <span className="font-bold">{level}</span> / {upgrade.maxLevel}
              </p>
              <p className="mt-1 text-xs text-white/40">
                Cost: {upgrade.goldCost}g
                {upgrade.waterCost > 0 && ` · ${upgrade.waterCost} water`}
                {upgrade.ironCost > 0 && ` · ${upgrade.ironCost} iron`}
                {upgrade.leatherCost > 0 && ` · ${upgrade.leatherCost} leather`}
                {upgrade.woodCost > 0 && ` · ${upgrade.woodCost} wood`}
              </p>
              <button
                type="button"
                disabled={maxed || !canAfford}
                onClick={() => { if (purchaseCampUpgrade(upgrade.id)) SoundManager.play('click'); }}
                className="mt-4 w-full rounded-lg bg-desert-gold px-4 py-2 font-semibold text-desert-night disabled:opacity-40"
              >
                {maxed ? 'Max Level' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
