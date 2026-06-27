import { useEffect, useRef, useState } from 'react';
import { getUnseenActForMission, getFastTravelDestinations, getOverworldRegion, SHOP_ITEMS } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { WorldExploreManager } from '@/game/WorldExploreManager';
import { OverworldBridge } from '@/game/systems/OverworldBridge';
import { OverworldInput } from '@/game/systems/OverworldInput';
import { SoundManager } from '@/game/systems/SoundManager';
import { DialogSystem } from '@/ui/components/DialogSystem';
import { ActBannerModal } from '@/ui/components/ActBannerModal';
import { OverworldMinimap } from '@/ui/overworld/OverworldMinimap';
import { OverworldQuestTracker } from '@/ui/overworld/OverworldQuestTracker';
import { OverworldTouchControls } from '@/ui/overworld/OverworldTouchControls';
import { OverworldFullMap } from '@/ui/overworld/OverworldFullMap';

export function WorldExploreView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<WorldExploreManager | null>(null);

  const save = useGameStore((s) => s.save);
  const setScreen = useGameStore((s) => s.setScreen);
  const restAtCamp = useGameStore((s) => s.restAtCamp);
  const purchaseShopItem = useGameStore((s) => s.purchaseShopItem);
  const showCampIntroIfNeeded = useGameStore((s) => s.showCampIntroIfNeeded);
  const checkInitialActBanner = useGameStore((s) => s.checkInitialActBanner);
  const pendingActBanner = useGameStore((s) => s.pendingActBanner);
  const dismissActBanner = useGameStore((s) => s.dismissActBanner);
  const pendingDialog = useGameStore((s) => s.pendingDialog);
  const dismissDialog = useGameStore((s) => s.dismissDialog);
  const interactPrompt = useGameStore((s) => s.overworldInteract.prompt);
  const overworldDialog = useGameStore((s) => s.overworldDialog);
  const dismissOverworldDialog = useGameStore((s) => s.dismissOverworldDialog);
  const missionOffer = useGameStore((s) => s.overworldMissionOffer);
  const setOverworldMissionOffer = useGameStore((s) => s.setOverworldMissionOffer);
  const acceptOverworldMission = useGameStore((s) => s.acceptOverworldMission);
  const campOpen = useGameStore((s) => s.overworldCampOpen);
  const setOverworldCampOpen = useGameStore((s) => s.setOverworldCampOpen);
  const unlockToast = useGameStore((s) => s.overworldUnlockToast);
  const lastResult = useGameStore((s) => s.lastMissionResult);
  const refreshOverworldAfterMission = useGameStore((s) => s.refreshOverworldAfterMission);
  const mapOpen = useGameStore((s) => s.overworldMapOpen);
  const setOverworldMapOpen = useGameStore((s) => s.setOverworldMapOpen);
  const fastTravelTo = useGameStore((s) => s.fastTravelTo);

  const [shopOpen, setShopOpen] = useState(false);
  const regionId = save.overworldPosition.regionId || 'nahran-outskirts';
  const regionName = getOverworldRegion(regionId).name;

  const overlayOpen = Boolean(
    campOpen || shopOpen || overworldDialog || missionOffer || pendingActBanner || pendingDialog || mapOpen,
  );

  useEffect(() => {
    OverworldInput.attach();
    return () => OverworldInput.detach();
  }, []);

  useEffect(() => {
    checkInitialActBanner();
    showCampIntroIfNeeded();
    useGameStore.setState({ mapHomeScreen: 'world_explore' });
  }, [checkInitialActBanner, showCampIntroIfNeeded]);

  useEffect(() => {
    if (!containerRef.current) return;
    const manager = new WorldExploreManager(containerRef.current, regionId);
    managerRef.current = manager;
    manager.start();
    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [regionId]);

  useEffect(() => () => {
    OverworldBridge.flushSave();
  }, []);

  useEffect(() => {
    if (lastResult?.victory) {
      refreshOverworldAfterMission();
      managerRef.current?.refresh();
    }
  }, [lastResult?.missionId, lastResult?.victory, refreshOverworldAfterMission]);

  const navigate = (screen: Parameters<typeof setScreen>[0]) => {
    SoundManager.play('click');
    setScreen(screen);
  };

  const handleFastTravel = (poiId: string) => {
    const poi = getOverworldRegion(regionId).pois.find((p) => p.id === poiId);
    if (!poi || !fastTravelTo(poiId)) return;
    SoundManager.play('click');
    managerRef.current?.teleport(poi.x, poi.y);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-desert-night text-white">
      <header className="pointer-events-auto relative z-20 flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('main_menu')}
          className="text-sm text-white/60 hover:text-white"
        >
          ← Main Menu
        </button>
        <div className="font-display text-base text-desert-gold sm:text-lg">{regionName}</div>
        <div className="flex gap-3 text-xs text-desert-gold sm:text-sm">
          <span>Lv.{save.level}</span>
          <span>{save.gold}g</span>
          {(save.water ?? 0) > 0 && <span className="text-teal-300">{save.water} water</span>}
        </div>
      </header>

      <div className="pointer-events-auto relative z-20 flex shrink-0 gap-2 overflow-x-auto border-b border-white/5 px-3 py-2 sm:px-6">
        <NavBtn label="Camp" onClick={() => { SoundManager.play('click'); setOverworldCampOpen(true); }} />
        <NavBtn label="Map (M)" onClick={() => { SoundManager.play('click'); setOverworldMapOpen(true); }} />
        <NavBtn label="Region Map" onClick={() => navigate('world_map')} />
        <NavBtn label="Inventory" onClick={() => navigate('inventory')} />
        <NavBtn label="Upgrades" onClick={() => navigate('upgrade')} />
        <NavBtn label="Lore" onClick={() => navigate('lore')} />
      </div>

      <div
        className="relative min-h-0 flex-1"
        onPointerDown={() => containerRef.current?.querySelector('canvas')?.focus()}
      >
        <div ref={containerRef} className="absolute inset-0 [&_canvas]:outline-none" />

        <OverworldQuestTracker />
        <OverworldMinimap />
        <OverworldTouchControls />

        {interactPrompt && !overlayOpen && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-desert-gold/50 bg-black/75 px-5 py-2 text-sm text-desert-gold shadow-lg">
            {interactPrompt}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden rounded-lg bg-black/60 px-3 py-2 text-[10px] text-white/50 sm:block">
          <p>WASD / Arrows — move</p>
          <p>E — interact · M — map</p>
        </div>
      </div>

      {mapOpen && (
        <OverworldFullMap onClose={() => { SoundManager.play('click'); setOverworldMapOpen(false); }} />
      )}

      {campOpen && (
        <CampOverlay
          regionId={regionId}
          onClose={() => setOverworldCampOpen(false)}
          onFastTravel={handleFastTravel}
          onRest={() => { restAtCamp(); SoundManager.play('click'); }}
          onShop={() => { setOverworldCampOpen(false); setShopOpen(true); }}
          onUpgrades={() => { setOverworldCampOpen(false); navigate('upgrade'); }}
          onCampUpgrades={() => { setOverworldCampOpen(false); navigate('camp_upgrades'); }}
          onRelics={() => { setOverworldCampOpen(false); navigate('relic_upgrades'); }}
          onInventory={() => { setOverworldCampOpen(false); navigate('inventory'); }}
          onLore={() => { setOverworldCampOpen(false); navigate('lore'); }}
        />
      )}

      {shopOpen && (
        <ShopOverlay
          onClose={() => setShopOpen(false)}
          onPurchase={(itemId) => { if (purchaseShopItem(itemId)) SoundManager.play('click'); }}
        />
      )}

      {overworldDialog && (
        <DialogSystem
          lines={overworldDialog.lines.map((text) => ({ speaker: overworldDialog.name, text }))}
          onComplete={dismissOverworldDialog}
        />
      )}

      {missionOffer && (
        <MissionOfferModal
          title={missionOffer.title}
          brief={missionOffer.brief}
          onAccept={() => {
            SoundManager.play('click');
            const unseenAct = getUnseenActForMission(missionOffer.missionId, save.seenActs);
            if (unseenAct) {
              useGameStore.setState({
                pendingActBanner: unseenAct,
                pendingMissionId: missionOffer.missionId,
                missionReturnScreen: 'world_explore',
                overworldMissionOffer: null,
              });
              return;
            }
            acceptOverworldMission();
          }}
          onDecline={() => { SoundManager.play('click'); setOverworldMissionOffer(null); }}
        />
      )}

      {pendingActBanner && <ActBannerModal actId={pendingActBanner} onDismiss={dismissActBanner} />}

      {pendingDialog && <DialogSystem lines={pendingDialog.lines} onComplete={dismissDialog} />}

      {unlockToast && (
        <div className="pointer-events-none absolute left-1/2 top-28 z-30 -translate-x-1/2 rounded-xl border border-teal-400/40 bg-teal-950/90 px-6 py-4 text-sm text-teal-100 shadow-xl">
          <p className="font-semibold text-teal-300">{unlockToast}</p>
          <p className="mt-1 text-xs text-white/70">Walk the desert roads to find what opened.</p>
        </div>
      )}
    </div>
  );
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
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

function MissionOfferModal({
  title,
  brief,
  onAccept,
  onDecline,
}: {
  title: string;
  brief: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-400/40 bg-desert-night/95 p-8 text-white shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-widest text-red-300">Defense mission</p>
        <h3 className="font-display mb-3 text-2xl text-desert-gold">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-white/75">{brief}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-lg border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-lg bg-desert-gold py-3 text-sm font-semibold text-desert-night hover:bg-yellow-400"
          >
            Start mission
          </button>
        </div>
      </div>
    </div>
  );
}

function CampOverlay({
  regionId,
  onClose,
  onFastTravel,
  onRest,
  onShop,
  onUpgrades,
  onCampUpgrades,
  onRelics,
  onInventory,
  onLore,
}: {
  regionId: string;
  onClose: () => void;
  onFastTravel: (poiId: string) => void;
  onRest: () => void;
  onShop: () => void;
  onUpgrades: () => void;
  onCampUpgrades: () => void;
  onRelics: () => void;
  onInventory: () => void;
  onLore: () => void;
}) {
  const save = useGameStore((s) => s.save);
  const travelPoints = getFastTravelDestinations(getOverworldRegion(regionId), save);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-desert-gold/40 bg-desert-night p-8 text-white">
        <h3 className="font-display mb-2 text-2xl text-desert-gold">Nahran Camp</h3>
        <p className="mb-4 text-white/70">
          Tents glow against the dunes. Malik rests with scouts, smiths, and guards before the next battle.
        </p>
        <div className="mb-6 space-y-1 rounded-lg bg-black/30 p-4 text-sm">
          <p>Level {save.level} · {save.gold} gold · {save.water ?? 0} water</p>
          <p className="text-white/50">Missions completed: {save.completedMissions.length}</p>
        </div>

        {travelPoints.length > 1 && (
          <div className="mb-4 rounded-lg border border-teal-400/30 bg-teal-950/20 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-300">Fast travel</p>
            <div className="space-y-2">
              {travelPoints.map((poi) => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => onFastTravel(poi.id)}
                  className="w-full rounded-lg border border-teal-400/40 py-2 text-sm text-teal-100 hover:bg-teal-500/10"
                >
                  → {poi.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 space-y-2">
          <OverlayBtn onClick={onRest} disabled={save.restBonusActive} className="border-green-500/50 text-green-300">
            {save.restBonusActive ? 'Rest bonus ready' : 'Rest (+10% HP next mission)'}
          </OverlayBtn>
          <OverlayBtn onClick={onShop} className="border-cyan-400/50 text-cyan-200">Merchant</OverlayBtn>
          <OverlayBtn onClick={onUpgrades}>Malik Upgrades</OverlayBtn>
          <OverlayBtn onClick={onCampUpgrades} className="border-amber-400/50 text-amber-200">Camp Upgrades</OverlayBtn>
          <OverlayBtn onClick={onRelics} className="border-purple-400/50 text-purple-200">Sentinel Relics</OverlayBtn>
          <OverlayBtn onClick={onInventory} className="border-blue-400/50 text-blue-200">Inventory</OverlayBtn>
          <OverlayBtn onClick={onLore} className="border-purple-400/50 text-purple-200">Desert Lore</OverlayBtn>
        </div>
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); onClose(); }}
          className="w-full rounded-lg bg-desert-gold py-3 font-semibold text-desert-night"
        >
          Return to exploration
        </button>
      </div>
    </div>
  );
}

function OverlayBtn({
  children,
  onClick,
  disabled,
  className = 'border-desert-gold/50 text-desert-gold',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg border py-3 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

function ShopOverlay({
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
        <h3 className="font-display mb-2 text-2xl text-cyan-300">Camp Merchant</h3>
        <p className="mb-4 text-sm text-desert-gold">{save.gold} gold available</p>
        <div className="mb-6 max-h-64 space-y-3 overflow-y-auto">
          {SHOP_ITEMS.map((item) => {
            const discount = (save.campUpgrades.merchant_tents ?? 0) * 0.1;
            const cost = Math.max(1, Math.round(item.cost * (1 - discount)));
            return (
              <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-cyan-200">{item.name}</p>
                    <p className="text-xs text-white/60">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={save.gold < cost}
                    onClick={() => onPurchase(item.id)}
                    className="shrink-0 rounded border border-cyan-400/50 px-3 py-1 text-sm text-cyan-200 disabled:opacity-40"
                  >
                    {cost}g
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
          Close
        </button>
      </div>
    </div>
  );
}
