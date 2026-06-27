import { INVENTORY_ITEMS, CRAFT_RECIPES, formatRecipeCost, getInventoryItem, getBuildDisplayOrder, getBuildDefinition, isBuildUnlocked, getBuildUnlockHint } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { LION_MODE_LABELS, type LionMode } from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

export function InventoryScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const useInventoryItem = useGameStore((s) => s.useInventoryItem);
  const craftItem = useGameStore((s) => s.craftItem);
  const setSelectedBuild = useGameStore((s) => s.setSelectedBuild);
  const setLionMode = useGameStore((s) => s.setLionMode);

  const canCraft = (recipe: (typeof CRAFT_RECIPES)[number]) => {
    if (
      recipe.requiresCompletedMission &&
      !save.completedMissions.includes(recipe.requiresCompletedMission)
    ) {
      return false;
    }
    if (recipe.ironCost && save.iron < recipe.ironCost) return false;
    if (recipe.leatherCost && save.leather < recipe.leatherCost) return false;
    if (recipe.woodCost && save.wood < recipe.woodCost) return false;
    if (recipe.inventoryCosts) {
      for (const [itemId, qty] of Object.entries(recipe.inventoryCosts)) {
        if ((save.inventory[itemId] ?? 0) < qty) return false;
      }
    }
    return true;
  };

  const buildCtx = {
    completedMissions: save.completedMissions,
    lionLevel: save.upgrades.lion_level ?? 0,
    lionDenCampLevel: save.campUpgrades.lion_den ?? 0,
  };

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button type="button" onClick={() => { SoundManager.play('click'); setScreen(useGameStore.getState().mapHomeScreen); }} className="text-white/60 hover:text-white">
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Inventory & Camp</h2>
        <span className="text-sm text-white/60">
          {save.iron} iron · {save.leather} leather · {save.wood} wood
        </span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-auto p-8 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-semibold text-desert-gold">Consumables</h3>
          <div className="space-y-3">
            {INVENTORY_ITEMS.filter((i) => i.category === 'consumable').map((item) => {
              const count = save.inventory[item.id] ?? 0;
              return (
                <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-white/50">{item.description}</p>
                      <p className="mt-1 text-xs text-white/40">Owned: {count}</p>
                    </div>
                    <button
                      type="button"
                      disabled={count <= 0 || !!save.missionBoost}
                      onClick={() => { if (useInventoryItem(item.id)) SoundManager.play('click'); }}
                      className="rounded border border-desert-gold/50 px-3 py-1 text-sm text-desert-gold disabled:opacity-40"
                    >
                      Use
                    </button>
                  </div>
                </div>
              );
            })}
            {INVENTORY_ITEMS.filter((i) => i.category === 'consumable').every((i) => !(save.inventory[i.id] ?? 0)) && (
              <p className="text-sm text-white/40">No consumables — craft, buy from merchants, or earn rewards.</p>
            )}
          </div>

          <h3 className="mb-3 mt-8 font-semibold text-desert-gold">Crafting</h3>
          <div className="space-y-3">
            {CRAFT_RECIPES.map((recipe) => {
              const locked =
                !!recipe.requiresCompletedMission &&
                !save.completedMissions.includes(recipe.requiresCompletedMission);
              const output = getInventoryItem(recipe.outputItemId);
              return (
                <div key={recipe.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{recipe.name}</p>
                      <p className="text-xs text-white/50">{recipe.description}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {locked
                          ? `Unlock: complete ${recipe.requiresCompletedMission?.replace(/-/g, ' ')}`
                          : `Cost: ${formatRecipeCost(recipe)} → +${recipe.outputQuantity} ${output?.name ?? recipe.outputItemId}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={locked || !canCraft(recipe)}
                      onClick={() => { if (craftItem(recipe.id)) SoundManager.play('click'); }}
                      className="rounded border border-desert-gold/50 px-3 py-1 text-sm text-desert-gold disabled:opacity-40"
                    >
                      Craft
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-desert-gold">Build Choice</h3>
            <div className="flex flex-wrap gap-2">
              {getBuildDisplayOrder().map((buildId) => {
                const def = getBuildDefinition(buildId);
                const locked = !isBuildUnlocked(buildId, buildCtx);
                const hint = getBuildUnlockHint(buildId);
                return (
                <button
                  key={buildId}
                  type="button"
                  disabled={locked}
                  onClick={() => { if (!locked) { setSelectedBuild(buildId); SoundManager.play('click'); } }}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm min-w-[7rem] ${
                    save.selectedBuild === buildId
                      ? 'border-desert-gold bg-desert-gold/20 text-desert-gold'
                      : 'border-white/20 text-white/70'
                  } ${locked ? 'opacity-40' : ''}`}
                >
                  {def?.name ?? buildId}
                  {locked && hint && <span className="block text-[10px] text-white/40">{hint}</span>}
                </button>
              );})}
            </div>
          </div>

          {(save.upgrades.lion_level ?? 0) >= 1 && (
            <div>
              <h3 className="mb-3 font-semibold text-desert-gold">Sahar — Lion Mode</h3>
              <div className="flex flex-wrap gap-2">
                {(['follow', 'guard', 'guard_left', 'guard_right', 'aggressive'] as LionMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setLionMode(mode); SoundManager.play('click'); }}
                    className={`flex-1 rounded-lg border px-2 py-2 text-[10px] ${
                      save.lionMode === mode
                        ? 'border-desert-gold bg-desert-gold/20 text-desert-gold'
                        : 'border-white/20 text-white/70'
                    }`}
                  >
                    {LION_MODE_LABELS[mode]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-semibold text-desert-gold">Materials</h3>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm space-y-1">
              <p>Iron: {save.iron} — gate workshop & war camp</p>
              <p>Leather: {save.leather} — lion den & merchant tents</p>
              <p>Wood: {save.wood} — palm timbers & camp construction</p>
              <p>Water: {save.water}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
