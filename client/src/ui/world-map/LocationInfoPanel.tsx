import {
  getLocationById,
  getMissionById,
  getActForMission,
  getUnlockHint,
  getMapNodeState,
  getMissionTypeLabel,
  getNodeTypeLabel,
  getRegionForNode,
  getMissionInventoryReward,
  getLocationsUnlockedByMission,
  getLocationDisplayName,
  getBuildUnlocksGrantedByMission,
  getBuildDefinition,
  PRIMARY_ROUTE,
  type MissionDefinition,
} from '@malik/shared';
import type { LocalSaveData } from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

interface LocationInfoPanelProps {
  locationId: string | null;
  save: LocalSaveData;
  currentNodeId: string;
  onStartMission: (mission: MissionDefinition) => void;
  onOpenCamp: () => void;
  onOpenShop: () => void;
  onCollectResource: (locationId: string) => void;
  onDiscoverLore: (locationId: string, loreId: string) => void;
  onNavigate: (screen: 'inventory' | 'upgrade' | 'camp_upgrades' | 'relic_upgrades' | 'lore') => void;
}

export function LocationInfoPanel({
  locationId,
  save,
  currentNodeId,
  onStartMission,
  onOpenCamp,
  onOpenShop,
  onCollectResource,
  onDiscoverLore,
  onNavigate,
}: LocationInfoPanelProps) {
  if (!locationId) {
    return (
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-desert-gold/20 bg-black/40 p-6 text-white">
        <h3 className="font-display mb-2 text-xl text-desert-gold">Desert Journey</h3>
        <p className="text-sm leading-relaxed text-white/60">
          Click a location on the map to read its story, preview rewards, and begin your next mission.
        </p>
        <p className="mt-4 text-xs text-white/40">
          The golden marker shows where Malik must travel next.
        </p>
      </aside>
    );
  }

  const loc = getLocationById(locationId);
  if (!loc) return null;

  const state = getMapNodeState(locationId, save, currentNodeId);
  const region = getRegionForNode(locationId);
  const mission = loc.missionId ? getMissionById(loc.missionId) : undefined;
  const unlocked = state !== 'locked';
  const completed = mission ? save.completedMissions.includes(mission.id) : false;
  const act = mission ? getActForMission(mission.id) : undefined;

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-desert-gold/20 bg-black/40 text-white">
      <div className="flex-1 overflow-auto p-6">
        {region && (
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-desert-ember/80">{region.name}</p>
        )}
        {act && <p className="mb-1 text-xs text-desert-ember/70">{act.subtitle}</p>}

        <h3 className="font-display mb-2 text-2xl text-desert-gold">{loc.name}</h3>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge label={getNodeTypeLabel(loc.type)} />
          {mission && <Badge label={getMissionTypeLabel(mission.type)} />}
          {state === 'current' && <Badge label="Current objective" highlight />}
          {state === 'completed' && <Badge label="Completed" green />}
          {state === 'locked' && <Badge label="Locked" muted />}
        </div>

        <p className="mb-4 text-sm italic leading-relaxed text-white/70">{loc.description}</p>

        {state === 'locked' && mission && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-950/20 p-3 text-sm text-red-200/90">
            <p>{getUnlockHint(locationId)}</p>
            <UnlockPreview missionId={mission.id} showWhenLocked />
          </div>
        )}

        {mission && unlocked && (
          <MissionDetails mission={mission} completed={completed} save={save} />
        )}

        {loc.type === 'camp' && unlocked && (
          <CampPanel onOpenCamp={onOpenCamp} onNavigate={onNavigate} save={save} />
        )}

        {loc.type === 'shop' && unlocked && (
          <p className="mb-4 text-sm text-cyan-200/80">
            Desert traders sell rations and remedies. Stock up before the next battle.
          </p>
        )}

        {loc.type === 'lore' && unlocked && loc.loreId && (
          <p className="mb-4 text-sm text-purple-200/80">
            {save.unlockedLore.includes(loc.loreId)
              ? 'You have already read the lore at this site.'
              : 'Ancient markings wait to be discovered here.'}
          </p>
        )}

        {loc.type === 'resource' && unlocked && (
          <p className="mb-4 text-sm text-blue-200/80">
            {save.collectedResources.includes(loc.id)
              ? 'Supplies from this site have already been claimed.'
              : 'One-time supplies can be gathered from this hidden site.'}
          </p>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <PanelActions
          loc={loc}
          state={state}
          save={save}
          mission={mission}
          unlocked={unlocked}
          completed={completed}
          onStartMission={onStartMission}
          onOpenCamp={onOpenCamp}
          onOpenShop={onOpenShop}
          onCollectResource={onCollectResource}
          onDiscoverLore={onDiscoverLore}
        />
      </div>
    </aside>
  );
}

function MissionDetails({
  mission,
  completed,
  save,
}: {
  mission: MissionDefinition;
  completed: boolean;
  save: LocalSaveData;
}) {
  const waveCount = mission.waves.length;
  const enemyTypes = [...new Set(mission.waves.flatMap((w) => w.enemies.map((e) => e.type)))];
  const firstClearLoot = getMissionInventoryReward(mission.id);
  const hasFirstClearLoot = !save.completedMissions.includes(mission.id) && Object.keys(firstClearLoot).length > 0;

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-desert-gold/30 bg-desert-gold/5 p-3">
        <p className="text-xs uppercase tracking-wider text-desert-gold/80">Objective</p>
        <p className="mt-1 font-medium text-white">{mission.objective}</p>
      </div>

      {mission.storyBrief && (
        <p className="text-xs leading-relaxed text-white/50">{mission.storyBrief}</p>
      )}

      <div className="rounded-lg bg-black/30 p-3 space-y-2">
        <Row label="Difficulty" value={'★'.repeat(mission.difficulty) + '☆'.repeat(5 - mission.difficulty)} />
        <Row label="Waves" value={String(waveCount)} />
        <Row label="Enemies" value={enemyTypes.map((e) => e.replace(/_/g, ' ')).join(', ')} />
        <Row label="Gold reward" value={`${mission.baseRewardGold}g + bonuses`} />
        {mission.perfectGateBonusGold > 0 && (
          <Row
            label={mission.type === 'oasis' ? 'Perfect well' : 'Perfect gate'}
            value={`+${mission.perfectGateBonusGold}g`}
          />
        )}
        {mission.type === 'oasis' && <Row label="Water" value="1–2 on victory" />}
        {mission.requiresBossKill && (
          <Row label="Boss" value={`Slay ${mission.requiresBossKill.replace(/_/g, ' ')}`} />
        )}
        {hasFirstClearLoot && (
          <Row
            label="First clear"
            value={Object.entries(firstClearLoot)
              .map(([id, qty]) => `${qty}× ${id.replace(/_/g, ' ')}`)
              .join(', ')}
          />
        )}
        {completed && save.bestScores[mission.id] != null && (
          <Row label="Best score" value={String(save.bestScores[mission.id])} />
        )}
      </div>

      {!completed && (
        <UnlockPreview missionId={mission.id} />
      )}
    </div>
  );
}

function UnlockPreview({
  missionId,
  showWhenLocked = false,
}: {
  missionId: string;
  showWhenLocked?: boolean;
}) {
  const unlocks = getLocationsUnlockedByMission(missionId);
  const builds = getBuildUnlocksGrantedByMission(missionId);
  if (unlocks.length === 0 && builds.length === 0) return null;

  return (
    <div className={`rounded-lg border border-teal-400/20 bg-teal-950/10 p-3 ${showWhenLocked ? 'mt-3' : ''}`}>
      <p className="text-xs uppercase tracking-wider text-teal-300/80">
        {showWhenLocked ? 'Rewards when prerequisite is cleared' : 'Unlocks on victory'}
      </p>
      {unlocks.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-white/60">
          {unlocks.map((id) => {
            const optional = !PRIMARY_ROUTE.includes(id as (typeof PRIMARY_ROUTE)[number]);
            return (
              <li key={id}>
                → {getLocationDisplayName(id)}
                {optional && <span className="ml-1 text-amber-300/70">(optional)</span>}
              </li>
            );
          })}
        </ul>
      )}
      {builds.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-cyan-200/70">
          {builds.map((id) => (
            <li key={id}>🔨 {getBuildDefinition(id)?.name ?? id} build</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CampPanel({
  onOpenCamp,
  onNavigate,
  save,
}: {
  onOpenCamp: () => void;
  onNavigate: LocationInfoPanelProps['onNavigate'];
  save: LocalSaveData;
}) {
  return (
    <div className="mb-4 space-y-2 text-sm text-white/70">
      <p>The last lanterns of Nahran burn against the desert night. Malik prepares for the road ahead.</p>
      <ul className="list-inside list-disc text-xs text-white/50 space-y-1">
        <li>Level {save.level} · {save.gold} gold</li>
        <li>Rest, upgrade, craft, and read lore</li>
      </ul>
      <div className="flex flex-wrap gap-2 pt-2">
        <SmallBtn label="Camp menu" onClick={onOpenCamp} />
        <SmallBtn label="Inventory" onClick={() => onNavigate('inventory')} />
        <SmallBtn label="Upgrades" onClick={() => onNavigate('upgrade')} />
      </div>
    </div>
  );
}

function PanelActions({
  loc,
  state,
  save,
  mission,
  unlocked,
  completed,
  onStartMission,
  onOpenCamp,
  onOpenShop,
  onCollectResource,
  onDiscoverLore,
}: {
  loc: NonNullable<ReturnType<typeof getLocationById>>;
  state: string;
  save: LocalSaveData;
  mission?: MissionDefinition;
  unlocked: boolean;
  completed: boolean;
  onStartMission: (m: MissionDefinition) => void;
  onOpenCamp: () => void;
  onOpenShop: () => void;
  onCollectResource: (id: string) => void;
  onDiscoverLore: (id: string, loreId: string) => void;
}) {
  if (loc.type === 'camp') {
    return (
      <ActionButton onClick={() => { SoundManager.play('click'); onOpenCamp(); }}>
        Enter Camp
      </ActionButton>
    );
  }

  if (!unlocked) {
    return (
      <ActionButton disabled variant="muted">
        Locked
      </ActionButton>
    );
  }

  if (loc.type === 'shop') {
    return (
      <ActionButton onClick={() => { SoundManager.play('click'); onOpenShop(); }}>
        Visit Merchants
      </ActionButton>
    );
  }

  if (loc.type === 'lore' && loc.loreId) {
    return (
      <ActionButton
        onClick={() => {
          SoundManager.play('click');
          onDiscoverLore(loc.id, loc.loreId!);
        }}
      >
        Read Lore
      </ActionButton>
    );
  }

  if (loc.type === 'resource') {
    const collected = save.collectedResources.includes(loc.id);
    return (
      <ActionButton
        disabled={collected}
        onClick={() => {
          SoundManager.play('click');
          onCollectResource(loc.id);
        }}
      >
        {collected ? 'Already Collected' : 'Collect Supplies'}
      </ActionButton>
    );
  }

  if (mission) {
    return (
      <ActionButton
        onClick={() => {
          SoundManager.play('click');
          onStartMission(mission);
        }}
      >
        {completed ? 'Replay Mission' : state === 'current' ? 'Start Mission' : 'Start Mission'}
      </ActionButton>
    );
  }

  return null;
}

function Badge({
  label,
  highlight,
  green,
  muted,
}: {
  label: string;
  highlight?: boolean;
  green?: boolean;
  muted?: boolean;
}) {
  const cls = highlight
    ? 'border-desert-gold/60 bg-desert-gold/20 text-desert-gold'
    : green
      ? 'border-green-500/50 bg-green-950/40 text-green-300'
      : muted
        ? 'border-white/20 bg-black/40 text-white/40'
        : 'border-white/20 bg-black/30 text-white/60';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/50">{label}</span>
      <span className="text-right text-white/90">{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'muted';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-lg py-3 font-semibold transition-colors ${
        disabled || variant === 'muted'
          ? 'cursor-not-allowed border border-white/20 bg-black/30 text-white/40'
          : 'bg-desert-gold text-desert-night hover:bg-yellow-400'
      }`}
    >
      {children}
    </button>
  );
}

function SmallBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => { SoundManager.play('click'); onClick(); }}
      className="rounded border border-desert-gold/40 px-2 py-1 text-xs text-desert-gold hover:bg-desert-gold/10"
    >
      {label}
    </button>
  );
}
