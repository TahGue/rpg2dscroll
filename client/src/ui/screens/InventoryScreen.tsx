import { CRAFT_RECIPES, INVENTORY_ITEMS, formatRecipeCost, getInventoryItem } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function InventoryScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const useInventoryItem = useGameStore((s) => s.useInventoryItem);
  const craftItem = useGameStore((s) => s.craftItem);

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

  const shownCategories = ['weapon', 'tool', 'armor', 'food', 'potion', 'material', 'fish', 'animal', 'quest', 'relic'] as const;

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button type="button" onClick={() => { SoundManager.play('click'); setScreen(useGameStore.getState().mapHomeScreen); }} className="text-white/60 hover:text-white">
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Adventure Inventory</h2>
        <span className="text-sm text-white/60">
          HP {save.playerStats.health}/{save.playerStats.maxHealth} · {save.gold} gold
        </span>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-auto p-8 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-semibold text-desert-gold">Gear & Supplies</h3>
          <div className="space-y-5">
            {shownCategories.map((category) => {
              const items = INVENTORY_ITEMS.filter((item) => item.category === category && (save.inventory[item.id] ?? 0) > 0);
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-white/40">{category.replace(/_/g, ' ')}</p>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const count = save.inventory[item.id] ?? 0;
                      const usable = item.category === 'food' || item.category === 'potion';
                      return (
                        <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{item.name} <span className="text-xs text-white/40">x{count}</span></p>
                              <p className="text-xs text-white/50">{item.description}</p>
                            </div>
                            {usable && (
                              <button
                                type="button"
                                disabled={count <= 0}
                                onClick={() => { if (useInventoryItem(item.id)) SoundManager.play('click'); }}
                                className="rounded border border-desert-gold/50 px-3 py-1 text-sm text-desert-gold disabled:opacity-40"
                              >
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {INVENTORY_ITEMS.every((item) => (save.inventory[item.id] ?? 0) <= 0) && (
              <p className="text-sm text-white/40">Gather, fish, hunt, and complete quests to fill Malik's pack.</p>
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
            <h3 className="mb-3 font-semibold text-desert-gold">Malik</h3>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm space-y-1">
              <p>Health: {save.playerStats.health}/{save.playerStats.maxHealth}</p>
              <p>Stamina: {save.playerStats.stamina}/{save.playerStats.maxStamina}</p>
              <p>Attack: {save.playerStats.attack}</p>
              <p>Defense: {save.playerStats.defense}</p>
              <p>Crafting Lv.{save.playerStats.craftingLevel} · Survival Lv.{save.playerStats.survivalLevel}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-desert-gold">Demo Goals</h3>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm space-y-2 text-white/65">
              <p>Gather wood, herbs, water, fish, hide, stone, and iron ore.</p>
              <p>Craft potions, arrows, spear, grilled fish, leather gloves, and torch.</p>
              <p>Defeat hyenas, bandits, and Bandit Captain Rashid to unlock the Oasis Road.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
