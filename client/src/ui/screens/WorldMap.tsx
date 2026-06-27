import { useState, useEffect } from 'react';
import {
  getMissionById,
  getUnseenActForMission,
  SHOP_ITEMS,
  getCurrentMapNodeId,
  getLocationDisplayName,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';
import { LoreDiscoveryModal } from '@/ui/screens/LoreScreen';
import { ActBannerModal } from '@/ui/components/ActBannerModal';
import { DialogSystem } from '@/ui/components/DialogSystem';
import { WorldMapCanvas } from '@/ui/world-map/WorldMapCanvas';
import { LocationInfoPanel } from '@/ui/world-map/LocationInfoPanel';

export function WorldMap() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const startMission = useGameStore((s) => s.startMission);
  const restAtCamp = useGameStore((s) => s.restAtCamp);
  const unlockLore = useGameStore((s) => s.unlockLore);
  const pendingActBanner = useGameStore((s) => s.pendingActBanner);
  const dismissActBanner = useGameStore((s) => s.dismissActBanner);
  const checkInitialActBanner = useGameStore((s) => s.checkInitialActBanner);
  const purchaseShopItem = useGameStore((s) => s.purchaseShopItem);
  const collectResource = useGameStore((s) => s.collectResource);
  const pendingDialog = useGameStore((s) => s.pendingDialog);
  const dismissDialog = useGameStore((s) => s.dismissDialog);
  const showCampIntroIfNeeded = useGameStore((s) => s.showCampIntroIfNeeded);
  const mapFocusLocationId = useGameStore((s) => s.mapFocusLocationId);
  const mapUnlockAnnouncement = useGameStore((s) => s.mapUnlockAnnouncement);
  const clearMapFocus = useGameStore((s) => s.clearMapFocus);

  const currentNodeId = getCurrentMapNodeId(save);
  const [selectedId, setSelectedId] = useState<string | null>(currentNodeId);
  const [mapFocusNode, setMapFocusNode] = useState<string | null>(null);
  const [campOpen, setCampOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [discoveredLoreId, setDiscoveredLoreId] = useState<string | null>(null);
  const [resourceToast, setResourceToast] = useState<string | null>(null);
  const [unlockToast, setUnlockToast] = useState<string[] | null>(null);

  useEffect(() => {
    checkInitialActBanner();
    showCampIntroIfNeeded();
  }, [checkInitialActBanner, showCampIntroIfNeeded]);

  useEffect(() => {
    if (mapFocusLocationId) {
      setSelectedId(mapFocusLocationId);
      setMapFocusNode(mapFocusLocationId);
      clearMapFocus();
    }
  }, [mapFocusLocationId, clearMapFocus]);

  useEffect(() => {
    if (mapUnlockAnnouncement && mapUnlockAnnouncement.length > 0) {
      setUnlockToast(mapUnlockAnnouncement);
      SoundManager.play('unlock');
      useGameStore.setState({ mapUnlockAnnouncement: null });
      const timer = window.setTimeout(() => setUnlockToast(null), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [mapUnlockAnnouncement]);

  const handleSelectLocation = (locId: string) => {
    SoundManager.play('click');
    setSelectedId(locId);
  };

  const handleStartMission = (missionId: string) => {
    const mission = getMissionById(missionId);
    if (!mission) return;

    const unseenAct = getUnseenActForMission(mission.id, save.seenActs);
    if (unseenAct) {
      useGameStore.setState({ pendingActBanner: unseenAct, pendingMissionId: mission.id });
      return;
    }

    startMission(mission.id);
  };

  const handleCollectResource = (locationId: string) => {
    const result = collectResource(locationId);
    if (result) {
      SoundManager.play('gold');
      setDiscoveredLoreId(result.loreId);
      const parts = [
        result.gold > 0 ? `${result.gold} gold` : '',
        result.water > 0 ? `${result.water} water` : '',
        result.iron > 0 ? `${result.iron} iron` : '',
        result.leather > 0 ? `${result.leather} leather` : '',
        result.wood > 0 ? `${result.wood} wood` : '',
      ].filter(Boolean);
      setResourceToast(`Collected: ${parts.join(', ')}`);
      window.setTimeout(() => setResourceToast(null), 3500);
    }
  };

  const handleDiscoverLore = (_locationId: string, loreId: string) => {
    unlockLore(loreId);
    setDiscoveredLoreId(loreId);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#2a1f3d] via-[#1a1428] to-[#0f0c14] text-white">
      <header className="relative z-10 flex shrink-0 flex-col gap-2 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); setScreen('main_menu'); }}
          className="self-start text-sm text-white/60 hover:text-white"
        >
          ← Main Menu
        </button>
        <div className="font-display text-base text-desert-gold sm:text-lg">Malik&apos;s Desert Journey</div>
        <div className="flex flex-wrap gap-3 text-xs text-desert-gold sm:justify-end sm:gap-4 sm:text-sm">
          <span>Lv.{save.level}</span>
          <span>{save.gold}g</span>
          {(save.water ?? 0) > 0 && <span className="text-teal-300">{save.water} water</span>}
          {save.ngPlusLevel > 0 && <span className="text-amber-300">NG+{save.ngPlusLevel}</span>}
        </div>
      </header>

      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/5 px-3 py-2 sm:flex-wrap sm:gap-2 sm:px-6">
        <MapNavBtn label="Camp" onClick={() => { SoundManager.play('click'); setSelectedId('nahran-camp'); setCampOpen(true); }} />
        <MapNavBtn label="Inventory" onClick={() => { SoundManager.play('click'); setScreen('inventory'); }} />
        <MapNavBtn label="Upgrades" onClick={() => { SoundManager.play('click'); setScreen('upgrade'); }} />
        <MapNavBtn label="Camp Upgrades" onClick={() => { SoundManager.play('click'); setScreen('camp_upgrades'); }} />
        <MapNavBtn label="Relics" onClick={() => { SoundManager.play('click'); setScreen('relic_upgrades'); }} />
        <MapNavBtn label="Lore" onClick={() => { SoundManager.play('click'); setScreen('lore'); }} />
        {save.campaignComplete && (
          <MapNavBtn label="New Game+" onClick={() => { SoundManager.play('click'); setScreen('post_game'); }} />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:gap-4 sm:p-4 lg:flex-row lg:p-6">
        <div className="relative h-[min(48vh,380px)] shrink-0 sm:h-[min(52vh,420px)] lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="pointer-events-none absolute bottom-3 right-3 z-30 hidden rounded-lg bg-black/60 px-3 py-2 text-[10px] text-white/50 sm:block">
            <p><span className="text-desert-gold">━━</span> Main route</p>
            <p><span className="text-white/40">- -</span> Optional path</p>
          </div>
          {selectedId !== currentNodeId && currentNodeId !== 'nahran-camp' && (
            <button
              type="button"
              onClick={() => {
                SoundManager.play('click');
                setSelectedId(currentNodeId);
              }}
              className="absolute left-3 top-3 z-30 rounded-lg border border-desert-gold/50 bg-black/70 px-3 py-1.5 text-xs font-semibold text-desert-gold shadow-lg hover:bg-desert-gold/10"
            >
              → Go to objective
            </button>
          )}
          <WorldMapCanvas
            save={save}
            currentNodeId={currentNodeId}
            selectedId={selectedId}
            focusNodeId={mapFocusNode}
            onSelect={handleSelectLocation}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden lg:w-96 lg:flex-none">
          <LocationInfoPanel
          locationId={selectedId}
          save={save}
          currentNodeId={currentNodeId}
          onStartMission={(m) => handleStartMission(m.id)}
          onOpenCamp={() => setCampOpen(true)}
          onOpenShop={() => setShopOpen(true)}
          onCollectResource={handleCollectResource}
          onDiscoverLore={handleDiscoverLore}
          onNavigate={(screen) => setScreen(screen)}
        />
        </div>
      </div>

      {campOpen && (
        <CampDialog
          onClose={() => setCampOpen(false)}
          onRest={() => { restAtCamp(); SoundManager.play('click'); }}
          onUpgrades={() => { setCampOpen(false); setScreen('upgrade'); }}
          onCampUpgrades={() => { setCampOpen(false); setScreen('camp_upgrades'); }}
          onRelics={() => { setCampOpen(false); setScreen('relic_upgrades'); }}
          onInventory={() => { setCampOpen(false); setScreen('inventory'); }}
          onLore={() => { setCampOpen(false); setScreen('lore'); }}
        />
      )}

      {shopOpen && (
        <ShopDialog
          onClose={() => setShopOpen(false)}
          onPurchase={(itemId) => { if (purchaseShopItem(itemId)) SoundManager.play('click'); }}
        />
      )}

      {discoveredLoreId && (
        <LoreDiscoveryModal loreId={discoveredLoreId} onClose={() => setDiscoveredLoreId(null)} />
      )}

      {pendingActBanner && (
        <ActBannerModal actId={pendingActBanner} onDismiss={dismissActBanner} />
      )}

      {pendingDialog && (
        <DialogSystem lines={pendingDialog.lines} onComplete={dismissDialog} />
      )}

      {resourceToast && (
        <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-blue-400/40 bg-blue-950/90 px-6 py-3 text-sm text-blue-100 shadow-lg">
          {resourceToast}
        </div>
      )}

      {unlockToast && unlockToast.length > 0 && (
        <div className="absolute left-1/2 top-24 z-30 w-full max-w-md -translate-x-1/2 rounded-xl border border-teal-400/40 bg-teal-950/90 px-6 py-4 text-sm text-teal-100 shadow-xl">
          <p className="mb-2 font-semibold text-teal-300">New paths revealed on the map</p>
          <ul className="space-y-1 text-xs text-white/80">
            {unlockToast.map((id) => (
              <li key={id}>→ {getLocationDisplayName(id)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CampDialog({
  onClose,
  onRest,
  onUpgrades,
  onLore,
  onCampUpgrades,
  onRelics,
  onInventory,
}: {
  onClose: () => void;
  onRest: () => void;
  onUpgrades: () => void;
  onLore: () => void;
  onCampUpgrades: () => void;
  onRelics: () => void;
  onInventory: () => void;
}) {
  const save = useGameStore((s) => s.save);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-desert-gold/40 bg-desert-night p-8 text-white">
        <h3 className="font-display mb-2 text-2xl text-desert-gold">Nahran Camp</h3>
        <p className="mb-4 text-white/70">
          The last lanterns of Nahran burn against the desert night. Malik rests with his people, sharpening his blade for the next battle.
        </p>
        <div className="mb-6 rounded-lg bg-black/30 p-4 text-sm space-y-1">
          <p>Level {save.level} · {save.gold} gold · {save.water ?? 0} water · {save.iron} iron · {save.leather} leather</p>
          <p className="text-white/50">Missions completed: {save.completedMissions.length}</p>
          <p className="text-white/50">Lore discovered: {save.unlockedLore.length}</p>
          {(save.upgrades.lion_level ?? 0) >= 1 && (
            <p className="text-desert-gold">Sahar the lion fights at your side</p>
          )}
          {save.missionBoost && (
            <p className="text-cyan-300">
              Boost ready:{' '}
              {save.missionBoost === 'hp' ? 'Date Rations (+25% HP)' : save.missionBoost === 'damage' ? 'Fire Stones (+20% dmg)' : 'Desert Ointment (2× repair)'}
              {' '}— use from Inventory
            </p>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <button
            type="button"
            onClick={onRest}
            disabled={save.restBonusActive}
            className="w-full rounded-lg border border-green-500/50 py-3 text-sm text-green-300 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {save.restBonusActive ? 'Rest bonus ready for next mission' : 'Rest (+10% HP on next mission)'}
          </button>
          <button type="button" onClick={onUpgrades} className="w-full rounded-lg border border-desert-gold/50 py-3 text-sm text-desert-gold hover:bg-desert-gold/10">
            Malik Upgrades
          </button>
          <button type="button" onClick={onCampUpgrades} className="w-full rounded-lg border border-amber-400/50 py-3 text-sm text-amber-200 hover:bg-amber-500/10">
            Camp Upgrades
          </button>
          <button type="button" onClick={onRelics} className="w-full rounded-lg border border-purple-400/50 py-3 text-sm text-purple-200 hover:bg-purple-500/10">
            Sentinel Relics
          </button>
          <button type="button" onClick={onInventory} className="w-full rounded-lg border border-blue-400/50 py-3 text-sm text-blue-200 hover:bg-blue-500/10">
            Inventory & Build
          </button>
          <button type="button" onClick={onLore} className="w-full rounded-lg border border-purple-400/50 py-3 text-sm text-purple-200 hover:bg-purple-500/10">
            Read Desert Lore
          </button>
        </div>

        <button
          type="button"
          onClick={() => { SoundManager.play('click'); onClose(); }}
          className="w-full rounded-lg bg-desert-gold py-3 font-semibold text-desert-night"
        >
          Return to Map
        </button>
      </div>
    </div>
  );
}

function ShopDialog({
  onClose,
  onPurchase,
}: {
  onClose: () => void;
  onPurchase: (itemId: string) => void;
}) {
  const save = useGameStore((s) => s.save);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/40 bg-desert-night p-8 text-white">
        <h3 className="font-display mb-2 text-2xl text-cyan-300">Merchant&apos;s Crossing</h3>
        <p className="mb-4 text-sm text-white/70">
          Traders sell remedies for the road. Items go to your inventory — use them at camp before a mission.
        </p>
        <p className="mb-4 text-sm text-desert-gold">{save.gold} gold available</p>

        <div className="mb-6 space-y-3">
          {SHOP_ITEMS.map((item) => {
            const discount = (save.campUpgrades.merchant_tents ?? 0) * 0.1;
            const cost = Math.max(1, Math.round(item.cost * (1 - discount)));
            const canAfford = save.gold >= cost;
            const owned = save.inventory[item.id] ?? 0;
            return (
              <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-cyan-200">{item.name}</p>
                    <p className="text-xs text-white/60">{item.description}</p>
                    {owned > 0 && <p className="mt-1 text-xs text-teal-300">In inventory: {owned}</p>}
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onPurchase(item.id)}
                    className="shrink-0 rounded border border-cyan-400/50 px-3 py-1 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {cost}g{discount > 0 && <span className="text-green-400"> (-{Math.round(discount * 100)}%)</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => { SoundManager.play('click'); onClose(); }}
          className="w-full rounded-lg bg-desert-gold py-3 font-semibold text-desert-night"
        >
          Return to Map
        </button>
      </div>
    </div>
  );
}

function MapNavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-desert-gold/30 bg-black/30 px-3 py-1.5 text-xs text-desert-gold hover:bg-desert-gold/10"
    >
      {label}
    </button>
  );
}
