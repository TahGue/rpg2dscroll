import { useEffect, useRef, useState } from 'react';
import { getAllFastTravelDestinations, getOverworldRegion, SHOP_ITEMS, getHero, AISHA, getWorldEvent, getNgPlusRewardMultiplier } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { WorldExploreManager } from '@/game/WorldExploreManager';
import { OverworldBridge } from '@/game/systems/OverworldBridge';
import { OverworldInput } from '@/game/systems/OverworldInput';
import { SoundManager } from '@/game/systems/SoundManager';
import { DialogSystem } from '@/ui/components/DialogSystem';
import { ActBannerModal } from '@/ui/components/ActBannerModal';
import { RegionIntroModal } from '@/ui/components/RegionIntroModal';
import { OverworldMinimap } from '@/ui/overworld/OverworldMinimap';
import { OverworldQuestTracker } from '@/ui/overworld/OverworldQuestTracker';
import { OverworldTouchControls } from '@/ui/overworld/OverworldTouchControls';
import { OverworldFullMap } from '@/ui/overworld/OverworldFullMap';

export function WorldExploreView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<WorldExploreManager | null>(null);

  const save = useGameStore((s) => s.save);
  const setScreen = useGameStore((s) => s.setScreen);
  const updateSaveFields = useGameStore((s) => s.updateSaveFields);
  const restAtCamp = useGameStore((s) => s.restAtCamp);
  const purchaseShopItem = useGameStore((s) => s.purchaseShopItem);
  const showCampIntroIfNeeded = useGameStore((s) => s.showCampIntroIfNeeded);
  const checkInitialActBanner = useGameStore((s) => s.checkInitialActBanner);
  const pendingActBanner = useGameStore((s) => s.pendingActBanner);
  const dismissActBanner = useGameStore((s) => s.dismissActBanner);
  const pendingRegionIntro = useGameStore((s) => s.pendingRegionIntro);
  const dismissRegionIntro = useGameStore((s) => s.dismissRegionIntro);
  const pendingDialog = useGameStore((s) => s.pendingDialog);
  const dismissDialog = useGameStore((s) => s.dismissDialog);
  const interactPrompt = useGameStore((s) => s.overworldInteract.prompt);
  const overworldDialog = useGameStore((s) => s.overworldDialog);
  const dismissOverworldDialog = useGameStore((s) => s.dismissOverworldDialog);
  const campOpen = useGameStore((s) => s.overworldCampOpen);
  const setOverworldCampOpen = useGameStore((s) => s.setOverworldCampOpen);
  const unlockToast = useGameStore((s) => s.overworldUnlockToast);
  const lastResult = useGameStore((s) => s.lastMissionResult);
  const refreshOverworldAfterMission = useGameStore((s) => s.refreshOverworldAfterMission);
  const mapOpen = useGameStore((s) => s.overworldMapOpen);
  const setOverworldMapOpen = useGameStore((s) => s.setOverworldMapOpen);
  const fastTravelTo = useGameStore((s) => s.fastTravelTo);
  const startNGPlus = useGameStore((s) => s.startNGPlus);
  const recruitOffer = useGameStore((s) => s.overworldRecruitOffer);
  const recruitHero = useGameStore((s) => s.recruitHero);
  const eventChoice = useGameStore((s) => s.overworldEventChoice);
  const resolveWorldEventChoice = useGameStore((s) => s.resolveWorldEventChoice);
  const dismissWorldEvent = useGameStore((s) => s.dismissWorldEvent);

  const [shopOpen, setShopOpen] = useState(false);
  const regionId = save.overworldPosition.regionId || 'drying-well';
  const regionName = getOverworldRegion(regionId).name;

  const overlayOpen = Boolean(
    campOpen || shopOpen || overworldDialog || pendingActBanner || pendingRegionIntro || pendingDialog || mapOpen || recruitOffer || eventChoice,
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

  const handleFastTravel = (poiId: string, targetRegionId: string) => {
    const poi = getOverworldRegion(targetRegionId).pois.find((p) => p.id === poiId);
    if (!poi || !fastTravelTo(poiId, targetRegionId)) return;
    SoundManager.play('click');
    if (targetRegionId === regionId) {
      managerRef.current?.teleport(poi.x, poi.y);
    }
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
        <NavBtn label="Region map (M)" onClick={() => { SoundManager.play('click'); setOverworldMapOpen(true); }} />
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
        <OverworldMinimap
          onOpenFullMap={() => {
            SoundManager.play('click');
            setOverworldMapOpen(true);
          }}
        />
        <OverworldTouchControls
          onOpenMap={() => {
            SoundManager.play('click');
            setOverworldMapOpen(true);
          }}
          onOpenCamp={() => {
            SoundManager.play('click');
            setOverworldCampOpen(true);
          }}
        />

        {interactPrompt && !overlayOpen && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-desert-gold/50 bg-black/75 px-5 py-2 text-sm text-desert-gold shadow-lg">
            {interactPrompt}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden rounded-lg bg-black/60 px-3 py-2 text-[10px] text-white/50 sm:block">
          <p>WASD / Arrows — move</p>
          <p>E — interact · J — attack · O — bow · M — map</p>
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
          onStartNGPlus={() => {
            const ngLevel = save.ngPlusLevel + 1;
            const bonusGold = 100 * ngLevel;
            if (
              window.confirm(
                `Begin New Game+ ${ngLevel}? Overworld progress resets, enemies grow stronger, heroes and upgrades are kept (+${bonusGold} gold).`,
              )
            ) {
              SoundManager.play('click');
              startNGPlus();
            }
          }}
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

      {eventChoice && (() => {
        const event = getWorldEvent(eventChoice.eventId);
        if (!event) return null;
        return (
          <WorldEventModal
            event={event}
            onChoose={(choiceId) => {
              SoundManager.play('gold');
              resolveWorldEventChoice(choiceId);
            }}
            onClose={() => {
              SoundManager.play('click');
              dismissWorldEvent();
            }}
          />
        );
      })()}

      {recruitOffer && (
        <RecruitOfferModal
          heroId={recruitOffer.heroId}
          onAccept={() => {
            SoundManager.play('unlock');
            recruitHero(recruitOffer.heroId);
          }}
          onDecline={() => {
            SoundManager.play('click');
            useGameStore.setState({ overworldRecruitOffer: null });
          }}
        />
      )}

      {pendingActBanner && <ActBannerModal actId={pendingActBanner} onDismiss={dismissActBanner} />}

      {pendingRegionIntro && (
        <RegionIntroModal regionId={pendingRegionIntro} onDismiss={dismissRegionIntro} />
      )}

      {pendingDialog && <DialogSystem lines={pendingDialog.lines} onComplete={dismissDialog} />}

      {save.campaignComplete && !save.demoCompletionSeen && !overlayOpen && (
        <DemoCompletionModal
          onClose={() => {
            SoundManager.play('unlock');
            updateSaveFields({ demoCompletionSeen: true });
          }}
        />
      )}

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

function WorldEventModal({
  event,
  onChoose,
  onClose,
}: {
  event: NonNullable<ReturnType<typeof getWorldEvent>>;
  onChoose: (choiceId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-amber-400/40 bg-desert-night/95 p-8 text-white shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-widest text-amber-300">World event</p>
        <h3 className="font-display mb-3 text-2xl text-desert-gold">{event.title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-white/75">{event.intro}</p>
        <div className="space-y-3">
          {event.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChoose(choice.id)}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-left hover:border-desert-gold/50 hover:bg-desert-gold/5"
            >
              <p className="font-semibold text-desert-gold">{choice.label}</p>
              <p className="mt-1 text-xs text-white/60">{choice.description}</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-white/20 py-2 text-sm text-white/60 hover:bg-white/5"
        >
          Leave for now
        </button>
      </div>
    </div>
  );
}

function DemoCompletionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-desert-gold/50 bg-desert-night/95 p-8 text-center text-white shadow-2xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-desert-gold/70">Demo Complete</p>
        <h3 className="font-display mb-3 text-3xl text-desert-gold">Oasis Road Unlocked</h3>
        <p className="mb-6 text-sm leading-relaxed text-white/70">
          Malik recovered the stolen water tools, defeated Bandit Captain Rashid, and reopened the road beyond Nahran.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-desert-gold px-6 py-3 text-sm font-semibold text-desert-night hover:bg-yellow-400"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
}

function RecruitOfferModal({
  heroId,
  onAccept,
  onDecline,
}: {
  heroId: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const hero = getHero(heroId) ?? AISHA;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-teal-400/40 bg-desert-night/95 p-8 text-white shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-widest text-teal-300">Recruit hero</p>
        <h3 className="font-display mb-1 text-2xl text-desert-gold">
          {hero.name} — {hero.title}
        </h3>
        <p className="mb-2 text-sm text-white/70">{hero.role}</p>
        <p className="mb-1 text-xs text-cyan-200">Passive: {hero.passiveDescription}</p>
        <p className="mb-6 text-xs text-cyan-200">
          Active — {hero.activeName}: {hero.activeDescription}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-lg border border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-lg bg-teal-500 py-3 text-sm font-semibold text-desert-night hover:bg-teal-400"
          >
            Recruit
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
  onStartNGPlus,
}: {
  regionId: string;
  onClose: () => void;
  onFastTravel: (poiId: string, targetRegionId: string) => void;
  onRest: () => void;
  onShop: () => void;
  onUpgrades: () => void;
  onCampUpgrades: () => void;
  onRelics: () => void;
  onInventory: () => void;
  onLore: () => void;
  onStartNGPlus: () => void;
}) {
  const save = useGameStore((s) => s.save);
  const region = getOverworldRegion(regionId);
  const travelPoints = getAllFastTravelDestinations(save);
  const rewardMult = getNgPlusRewardMultiplier(save.ngPlusLevel);
  const campTitle =
    region.id === 'drying-well'
      ? 'Malik\'s Camp'
      : region.id === 'scorpion-valley'
      ? 'Valley Camp'
      : region.id === 'black-eclipse-rim'
        ? 'Eclipse Outpost'
        : 'Nahran Camp';
  const campBlurb =
    region.id === 'drying-well'
      ? 'A quiet fire, storage baskets, a workbench, and a cooking stone. Sleep here to save and recover before the oasis road.'
      : region.id === 'scorpion-valley'
      ? 'Trappers and miners shelter in the canyon. Hamza keeps watch over the poison pools below.'
      : region.id === 'black-eclipse-rim'
        ? 'Sentinel scouts hold this ridge against the dark. The Black Eclipse Gate stands beyond.'
        : 'Tents glow against the dunes. Malik rests with scouts, smiths, and guards before the next battle.';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-desert-gold/40 bg-desert-night p-8 text-white">
        <h3 className="font-display mb-2 text-2xl text-desert-gold">{campTitle}</h3>
        <p className="mb-4 text-white/70">{campBlurb}</p>
        <div className="mb-6 space-y-1 rounded-lg bg-black/30 p-4 text-sm">
          <p>Level {save.level} · {save.gold} gold · HP {save.playerStats.health}/{save.playerStats.maxHealth}</p>
          <p className="text-white/50">Quests completed: {save.completedQuests.length} · Nahran reputation {save.reputation.nahran ?? 0}</p>
        </div>

        {travelPoints.length > 1 && (
          <div className="mb-4 rounded-lg border border-teal-400/30 bg-teal-950/20 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-300">Fast travel</p>
            <div className="space-y-2">
              {travelPoints.map(({ regionId: destRegionId, regionName, poi }) => (
                <button
                  key={`${destRegionId}:${poi.id}`}
                  type="button"
                  onClick={() => onFastTravel(poi.id, destRegionId)}
                  className="w-full rounded-lg border border-teal-400/40 py-2 text-sm text-teal-100 hover:bg-teal-500/10"
                >
                  → {poi.label}
                  {destRegionId !== regionId && (
                    <span className="text-teal-300/70"> · {regionName}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 space-y-2">
          <OverlayBtn onClick={onRest} className="border-green-500/50 text-green-300">
            Sleep / Save / Restore Health
          </OverlayBtn>
          <OverlayBtn onClick={onShop} className="border-cyan-400/50 text-cyan-200">Open Vendor Stalls</OverlayBtn>
          <OverlayBtn onClick={onUpgrades}>Malik Upgrades</OverlayBtn>
          <OverlayBtn onClick={onCampUpgrades} className="border-amber-400/50 text-amber-200">Camp Upgrades</OverlayBtn>
          <OverlayBtn onClick={onRelics} className="border-purple-400/50 text-purple-200">Sentinel Relics</OverlayBtn>
          <OverlayBtn onClick={onInventory} className="border-blue-400/50 text-blue-200">Inventory</OverlayBtn>
          <OverlayBtn onClick={onLore} className="border-purple-400/50 text-purple-200">Desert Lore</OverlayBtn>
        </div>
        {save.campaignComplete && (
          <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-950/25 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">New Game+</p>
            <p className="mb-3 text-xs text-white/60">
              NG+ {save.ngPlusLevel} · reward ×{rewardMult.toFixed(1)} · replay the adventure with kept heroes and upgrades
            </p>
            <button
              type="button"
              onClick={() => { SoundManager.play('click'); onStartNGPlus(); }}
              className="w-full rounded-lg border border-amber-400/50 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/10"
            >
              Begin New Game+ (+{100 * (save.ngPlusLevel + 1)} gold)
            </button>
          </div>
        )}
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
        <h3 className="font-display mb-2 text-2xl text-cyan-300">Nahran Vendor Stalls</h3>
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
                    <p className="text-[10px] uppercase tracking-widest text-desert-gold/60">{item.vendor}</p>
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
