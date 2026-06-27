import { UPGRADES, getUpgradeCost } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function UpgradeScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const spendGold = useGameStore((s) => s.spendGold);
  const upgradeLevel = useGameStore((s) => s.upgradeLevel);

  const handleUpgrade = (upgradeId: string) => {
    const def = UPGRADES.find((u) => u.id === upgradeId);
    if (!def) return;
    const current = save.upgrades[upgradeId] ?? (['lion_level', 'sand_slash', 'bow_level', 'spear_level'].includes(upgradeId) ? 0 : 1);
    if (current >= def.maxLevel) return;
    const cost = getUpgradeCost(def, Math.max(current, 1));
    if (!spendGold(cost)) return;
    SoundManager.play('click');
    upgradeLevel(upgradeId);
  };

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button type="button" onClick={() => { SoundManager.play('click'); setScreen('main_menu'); }} className="text-white/60 hover:text-white">
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Upgrades</h2>
        <span className="text-desert-gold">Lv.{save.level} · {save.gold}g</span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-8 md:grid-cols-2 lg:grid-cols-3">
        {UPGRADES.map((upgrade) => {
          const rawLevel = save.upgrades[upgrade.id];
          const zeroStart = upgrade.id === 'lion_level' || upgrade.id === 'sand_slash' || upgrade.id === 'bow_level' || upgrade.id === 'spear_level';
          const level = rawLevel ?? (zeroStart ? 0 : 1);
          const maxed = level >= upgrade.maxLevel;
          const cost = getUpgradeCost(upgrade, Math.max(level, 1));
          const canAfford = save.gold >= cost;
          const isLocked = zeroStart && level === 0;

          return (
            <div key={upgrade.id} className="rounded-xl border border-desert-gold/30 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-desert-gold">{upgrade.name}</h3>
                <span className="text-xs uppercase text-white/40">{upgrade.category}</span>
              </div>
              <p className="mt-1 text-sm text-white/60">{upgrade.description}</p>
              <p className="mt-3 text-sm">
                {isLocked ? (
                  <span className="text-desert-ember">
                    {upgrade.id === 'lion_level'
                      ? 'Locked — unlock to summon Sahar'
                      : upgrade.id === 'sand_slash'
                        ? 'Locked — unlock Sand Slash skill'
                        : upgrade.id === 'spear_level'
                          ? 'Locked — unlock Desert Spear'
                          : upgrade.id === 'bow_level'
                            ? 'Locked — unlock Desert Bow'
                            : 'Locked — unlock to use'}
                  </span>
                ) : (
                  <>
                    Level <span className="font-bold text-white">{level}</span> / {upgrade.maxLevel}
                  </>
                )}
              </p>
              {!isLocked && (
                <p className="mt-1 text-xs text-white/40">+{upgrade.effectPerLevel} per level</p>
              )}
              <button
                type="button"
                disabled={maxed || !canAfford}
                onClick={() => handleUpgrade(upgrade.id)}
                className="mt-4 w-full rounded-lg bg-desert-gold px-4 py-2 font-semibold text-desert-night disabled:cursor-not-allowed disabled:opacity-40"
              >
                {maxed ? 'Max Level' : isLocked ? `Unlock (${cost}g)` : `Upgrade (${cost}g)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
