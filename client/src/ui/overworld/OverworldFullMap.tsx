import { useState } from 'react';
import {
  getActiveOverworldPOIs,
  getOverworldMapRoads,
  getOverworldQuestHint,
  getOverworldRegion,
  isOverworldCellExplored,
  OVERWORLD_REGIONS,
  type LocalSaveData,
  type OverworldPOI,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';

const MAP_W = 560;
const MAP_H = 420;

interface OverworldFullMapProps {
  onClose: () => void;
}

export function OverworldFullMap({ onClose }: OverworldFullMapProps) {
  const save = useGameStore((s) => s.save);
  const livePos = useGameStore((s) => s.overworldLivePosition);
  const currentRegionId = save.overworldPosition.regionId || 'nahran-outskirts';
  const visited = save.visitedOverworldRegions?.length
    ? save.visitedOverworldRegions
    : [currentRegionId];
  const selectableRegions = Object.values(OVERWORLD_REGIONS).filter((r) => visited.includes(r.id));
  const [viewRegionId, setViewRegionId] = useState(currentRegionId);
  const region = getOverworldRegion(viewRegionId);
  const quest = getOverworldQuestHint(save);
  const isCurrentRegion = viewRegionId === currentRegionId;

  const pois = getActiveOverworldPOIs(region, save).filter(
    (poi) =>
      save.visitedOverworldPOIs.includes(poi.id) ||
      isOverworldCellExplored(viewRegionId, poi.x, poi.y, save.exploredOverworldCells),
  );

  const scaleX = MAP_W / region.width;
  const scaleY = MAP_H / region.height;
  const roads = getOverworldMapRoads(viewRegionId);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col rounded-2xl border border-desert-gold/40 bg-desert-night/95 p-4 text-white shadow-2xl sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-desert-gold/70">Desert region · M to close</p>
            <h3 className="font-display truncate text-xl text-desert-gold sm:text-2xl">{region.name}</h3>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">{region.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/20 px-3 py-1 text-sm text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {selectableRegions.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectableRegions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setViewRegionId(r.id)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] sm:text-xs ${
                  viewRegionId === r.id
                    ? 'border-desert-gold bg-desert-gold/15 text-desert-gold'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                {r.name}
                {r.id === currentRegionId && (
                  <span className="ml-1 text-teal-300/80">· here</span>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="mb-3 rounded-lg bg-black/30 px-3 py-2 text-xs text-white/75 sm:mb-4">
          <span className="text-desert-gold">Goal:</span> {quest}
        </p>

        <svg width="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="rounded-xl bg-[#2a2018]">
          <MapRoads roads={roads} scaleX={scaleX} scaleY={scaleY} />
          <ExploredCells
            save={save}
            regionId={viewRegionId}
            region={region}
            scaleX={scaleX}
            scaleY={scaleY}
          />
          {pois.map((poi) => (
            <g key={poi.id}>
              <circle
                cx={poi.x * scaleX}
                cy={poi.y * scaleY}
                r={poi.kind === 'camp_hub' ? 7 : 5}
                fill={poiColor(poi.kind)}
                opacity={0.9}
              />
              <text
                x={poi.x * scaleX}
                y={poi.y * scaleY - 10}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={9}
                opacity={0.85}
              >
                {poi.label}
              </text>
            </g>
          ))}
          {isCurrentRegion && (
            <circle
              cx={livePos.x * scaleX}
              cy={livePos.y * scaleY}
              r={6}
              fill="#ffffff"
              stroke="#d4a843"
              strokeWidth={2}
            />
          )}
        </svg>

        {!isCurrentRegion && (
          <p className="mt-2 text-center text-[10px] text-white/45">
            Malik is in {getOverworldRegion(currentRegionId).name} — switch tabs to see your position.
          </p>
        )}

        <MapLegend />
      </div>
    </div>
  );
}

function MapLegend() {
  const items: { color: string; label: string }[] = [
    { color: '#d4a843', label: 'Camp / hub' },
    { color: '#ff6644', label: 'Mission' },
    { color: '#88ccff', label: 'NPC' },
    { color: '#66ccaa', label: 'Event' },
    { color: '#ffffff', label: 'Malik' },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/60 sm:mt-4">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function poiColor(kind: OverworldPOI['kind']): string {
  if (kind === 'mission' || kind === 'ambush') return '#ff6644';
  if (kind === 'npc') return '#88ccff';
  if (kind === 'event') return '#66ccaa';
  if (kind === 'locked_gate') return '#ffaa44';
  if (kind === 'chest' || kind === 'cart') return '#aa88ff';
  if (kind === 'resource') return '#66bb88';
  return '#d4a843';
}

function MapRoads({
  roads,
  scaleX,
  scaleY,
}: {
  roads: { x: number; y: number; w: number; h: number }[];
  scaleX: number;
  scaleY: number;
}) {
  return (
    <>
      {roads.map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x * scaleX}
          y={r.y * scaleY}
          width={r.w * scaleX}
          height={r.h * scaleY}
          fill="#8b7355"
          opacity={0.55}
          rx={2}
        />
      ))}
    </>
  );
}

function ExploredCells({
  save,
  regionId,
  region,
  scaleX,
  scaleY,
}: {
  save: LocalSaveData;
  regionId: string;
  region: { width: number; height: number };
  scaleX: number;
  scaleY: number;
}) {
  const explored = new Set(save.exploredOverworldCells);
  const cellW = 100 * scaleX;
  const cellH = 100 * scaleY;
  const cols = Math.ceil(region.width / 100);
  const rows = Math.ceil(region.height / 100);
  const rects: { x: number; y: number }[] = [];

  for (let cx = 0; cx < cols; cx += 1) {
    for (let cy = 0; cy < rows; cy += 1) {
      if (explored.has(`${regionId}:${cx},${cy}`)) {
        rects.push({ x: cx * cellW, y: cy * cellH });
      }
    }
  }

  return (
    <>
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={cellW} height={cellH} fill="#c4a35a" opacity={0.35} />
      ))}
    </>
  );
}
