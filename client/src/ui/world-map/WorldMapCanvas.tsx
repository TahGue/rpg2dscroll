import {
  LOCATIONS,
  MAP_PATHS,
  MAP_REGIONS,
  NODE_ICONS,
  NODE_REGION,
  getMapNodeState,
  getMapPathState,
  getMapPosition,
  type MapNodeState,
} from '@malik/shared';
import type { LocalSaveData } from '@malik/shared';
import { MapPathDust } from './MapPathDust';
import { MapAmbientEffects } from './MapAmbientEffects';
import { useMapViewport } from './useMapViewport';

interface WorldMapCanvasProps {
  save: LocalSaveData;
  currentNodeId: string;
  selectedId: string | null;
  focusNodeId?: string | null;
  onSelect: (locationId: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export function WorldMapCanvas({
  save,
  currentNodeId,
  selectedId,
  focusNodeId,
  onSelect,
}: WorldMapCanvasProps) {
  const { containerRef, viewport, handlers, zoomIn, zoomOut, reset, focusNode } =
    useMapViewport(focusNodeId ?? null);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-desert-gold/25 shadow-inner">
      <div className="absolute right-3 top-3 z-30 flex flex-col gap-1">
        <MapZoomBtn label="+" onClick={zoomIn} title="Zoom in" />
        <MapZoomBtn label="−" onClick={zoomOut} title="Zoom out" />
        <MapZoomBtn label="⌂" onClick={reset} title="Reset view" />
        {selectedId && (
          <MapZoomBtn label="◎" onClick={() => focusNode(selectedId)} title="Center selection" />
        )}
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 z-30 text-[10px] text-white/40">
        Scroll to zoom · drag to pan
      </p>

      <div
        ref={containerRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        {...handlers}
      >
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#c4a35a] via-[#b8956a] to-[#8b6914]" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(80,50,20,0.08) 3px, rgba(80,50,20,0.08) 6px)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3d2817]/30 via-transparent to-[#1a1428]/20" />
      <div className="absolute right-[8%] top-[8%] h-24 w-32 rounded-full bg-[#2a1f3d]/15 blur-2xl" />
      <div className="absolute bottom-[10%] left-[5%] h-20 w-28 rounded-full bg-teal-900/20 blur-xl" />
      {/* Black Eclipse darkness in the far north */}
      <div
        className="pointer-events-none absolute left-[35%] top-0 h-[35%] w-[40%] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(26,20,40,0.55) 0%, transparent 70%)',
        }}
      />

      <CampGlow save={save} />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {MAP_REGIONS.map((region) => {
          const nodesInRegion = LOCATIONS.filter((l) => NODE_REGION[l.id] === region.id);
          if (nodesInRegion.length === 0) return null;
          const avgY = nodesInRegion.reduce((s, n) => s + getMapPosition(n.id).y, 0) / nodesInRegion.length;
          const minX = Math.min(...nodesInRegion.map((n) => getMapPosition(n.id).x));
          return (
            <text
              key={region.id}
              x={minX - 2}
              y={avgY + 8}
              fill="rgba(26,20,40,0.35)"
              fontSize="2.8"
              fontFamily="Georgia, serif"
              fontWeight="bold"
              transform={`rotate(-90 ${minX - 2} ${avgY + 8})`}
            >
              {region.name}
            </text>
          );
        })}

        {MAP_PATHS.map(({ from, to, primary }) => {
          const p1 = getMapPosition(from);
          const p2 = getMapPosition(to);
          const state = getMapPathState(from, to, save);
          const stroke =
            state === 'completed' ? '#d4a843' : state === 'unlocked' ? '#8b6914aa' : '#3d281744';
          const width = state === 'completed' ? 0.55 : primary ? 0.45 : 0.35;
          return (
            <line
              key={`${from}-${to}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={stroke}
              strokeWidth={width}
              strokeDasharray={state === 'locked' ? '1.2 1.8' : state === 'completed' ? 'none' : '2 1.5'}
              strokeLinecap="round"
              className={state === 'unlocked' ? 'map-path-active' : undefined}
            />
          );
        })}
      </svg>

      <MapPathDust save={save} />
      <MapAmbientEffects save={save} currentNodeId={currentNodeId} />

      {LOCATIONS.map((loc) => {
        const pos = getMapPosition(loc.id);
        const state = getMapNodeState(loc.id, save, currentNodeId);
        const selected = selectedId === loc.id;
        const icon = NODE_ICONS[loc.type] ?? '●';

        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc.id)}
            className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-desert-gold max-sm:scale-90 ${nodeStateClasses(state, selected)}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={loc.name}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg shadow-md backdrop-blur-sm ${nodeIconClasses(state, loc.type)}`}
            >
              {state === 'locked' ? '🔒' : icon}
            </span>
            <span
              className={`mt-1 max-w-[88px] truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${nodeLabelClasses(state)}`}
            >
              {loc.name.split(' ').slice(0, 2).join(' ')}
            </span>
            {state === 'completed' && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
                ✓
              </span>
            )}
          </button>
        );
      })}

      <PlayerMarker nodeId={currentNodeId} />
        </div>
      </div>
    </div>
  );
}

function MapZoomBtn({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-desert-gold/40 bg-black/70 text-sm text-desert-gold hover:bg-desert-gold/15"
    >
      {label}
    </button>
  );
}

function CampGlow({ save }: { save: LocalSaveData }) {
  const campState = getMapNodeState('nahran-camp', save, '');
  if (campState === 'locked') return null;

  const pos = getMapPosition('nahran-camp');
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      aria-hidden
    >
      <div className="h-16 w-16 animate-pulse rounded-full bg-amber-400/25 blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/60 blur-sm" />
    </div>
  );
}

function PlayerMarker({ nodeId }: { nodeId: string }) {
  const pos = getMapPosition(nodeId);
  if (nodeId === 'nahran-camp') return null;

  return (
    <div
      key={nodeId}
      className="pointer-events-none absolute z-20 -translate-x-1/2 transition-all duration-700 ease-out"
      style={{ left: `${pos.x}%`, top: `${pos.y - 9}%` }}
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <span className="rounded-full border-2 border-desert-gold bg-desert-night px-1.5 py-0.5 text-sm shadow-lg animate-bounce">
          ⚔️
        </span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-desert-gold drop-shadow">
          Malik
        </span>
      </div>
    </div>
  );
}

function nodeStateClasses(state: MapNodeState, selected: boolean): string {
  if (selected) return 'scale-110 z-20';
  if (state === 'current') return 'animate-pulse';
  if (state === 'locked') return 'opacity-70 cursor-not-allowed hover:scale-100';
  return '';
}

function nodeIconClasses(state: MapNodeState, nodeType: string): string {
  if (state === 'locked') return 'border-white/20 bg-black/50 text-white/40';
  if (state === 'current') return 'border-desert-gold bg-desert-gold/30 text-desert-gold shadow-desert-gold/40 shadow-lg ring-2 ring-desert-gold/50';
  if (state === 'completed') return 'border-green-500/60 bg-green-950/50 text-green-200';
  if (nodeType === 'boss') return 'border-red-400/70 bg-red-950/60 text-red-200';
  if (nodeType === 'lore') return 'border-purple-400/60 bg-purple-950/50 text-purple-200';
  if (nodeType === 'shop') return 'border-cyan-400/60 bg-cyan-950/50 text-cyan-200';
  if (nodeType === 'resource') return 'border-blue-400/60 bg-blue-950/50 text-blue-200';
  if (nodeType === 'ambush') return 'border-orange-400/60 bg-orange-950/50 text-orange-200';
  if (nodeType === 'camp') return 'border-amber-400/70 bg-amber-950/50 text-amber-100';
  return 'border-desert-gold/60 bg-desert-night/80 text-desert-gold';
}

function nodeLabelClasses(state: MapNodeState): string {
  if (state === 'locked') return 'bg-black/60 text-white/40';
  if (state === 'current') return 'bg-desert-gold/90 text-desert-night';
  if (state === 'completed') return 'bg-green-900/80 text-green-200';
  return 'bg-black/70 text-white/90';
}
