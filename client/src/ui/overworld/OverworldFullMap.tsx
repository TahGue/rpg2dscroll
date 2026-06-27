import {
  getActiveOverworldPOIs,
  getOverworldQuestHint,
  getOverworldRegion,
  isOverworldCellExplored,
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
  const regionId = save.overworldPosition.regionId || 'nahran-outskirts';
  const region = getOverworldRegion(regionId);
  const quest = getOverworldQuestHint(save);

  const pois = getActiveOverworldPOIs(region, save).filter(
    (poi) =>
      save.visitedOverworldPOIs.includes(poi.id) ||
      isOverworldCellExplored(regionId, poi.x, poi.y, save.exploredOverworldCells),
  );

  const scaleX = MAP_W / region.width;
  const scaleY = MAP_H / region.height;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-desert-gold/40 bg-desert-night/95 p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-desert-gold/70">World map · M to close</p>
            <h3 className="font-display text-2xl text-desert-gold">{region.name}</h3>
            <p className="mt-1 text-sm text-white/60">{region.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <p className="mb-4 rounded-lg bg-black/30 px-3 py-2 text-xs text-white/75">
          <span className="text-desert-gold">Goal:</span> {quest}
        </p>

        <svg width="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="rounded-xl bg-[#2a2018]">
          <MapRoads scaleX={scaleX} scaleY={scaleY} />
          <ExploredCells save={save} regionId={regionId} region={region} scaleX={scaleX} scaleY={scaleY} />
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
          <circle
            cx={livePos.x * scaleX}
            cy={livePos.y * scaleY}
            r={6}
            fill="#ffffff"
            stroke="#d4a843"
            strokeWidth={2}
          />
        </svg>

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
    <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/60">
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
  return '#d4a843';
}

function MapRoads({ scaleX, scaleY }: { scaleX: number; scaleY: number }) {
  const roads = [
    { x: 440, y: 1180, w: 720, h: 48 },
    { x: 700, y: 520, w: 48, h: 720 },
    { x: 900, y: 480, w: 400, h: 48 },
    { x: 1500, y: 880, w: 48, h: 200 },
    { x: 1040, y: 180, w: 48, h: 360 },
  ];
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
