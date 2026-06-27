import {
  getActiveOverworldPOIs,
  getOverworldRegion,
  isOverworldCellExplored,
  type LocalSaveData,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';

const MINIMAP_W = 168;
const MINIMAP_H = 130;

export function OverworldMinimap() {
  const save = useGameStore((s) => s.save);
  const livePos = useGameStore((s) => s.overworldLivePosition);
  const regionId = save.overworldPosition.regionId || 'nahran-outskirts';
  const region = getOverworldRegion(regionId);
  const pois = getActiveOverworldPOIs(region, save).filter(
    (poi) =>
      save.visitedOverworldPOIs.includes(poi.id) ||
      isOverworldCellExplored(regionId, poi.x, poi.y, save.exploredOverworldCells),
  );

  const scaleX = MINIMAP_W / region.width;
  const scaleY = MINIMAP_H / region.height;

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border border-desert-gold/30 bg-black/70 p-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[9px] uppercase tracking-wider text-desert-gold/80">Map</p>
      <svg width={MINIMAP_W} height={MINIMAP_H} className="rounded bg-[#2a2018]">
        <MinimapRoads scaleX={scaleX} scaleY={scaleY} />
        <ExploredCells save={save} regionId={regionId} region={region} scaleX={scaleX} scaleY={scaleY} />
        {pois.map((poi) => (
          <circle
            key={poi.id}
            cx={poi.x * scaleX}
            cy={poi.y * scaleY}
            r={poi.kind === 'camp_hub' ? 4 : 3}
            fill={poiColor(poi.kind)}
            opacity={0.9}
          />
        ))}
        <circle
          cx={livePos.x * scaleX}
          cy={livePos.y * scaleY}
          r={4}
          fill="#ffffff"
          stroke="#d4a843"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

function poiColor(kind: string): string {
  if (kind === 'mission' || kind === 'ambush') return '#ff6644';
  if (kind === 'npc') return '#88ccff';
  if (kind === 'locked_gate') return '#ffaa44';
  if (kind === 'chest' || kind === 'cart') return '#aa88ff';
  return '#d4a843';
}

function MinimapRoads({ scaleX, scaleY }: { scaleX: number; scaleY: number }) {
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
          rx={1}
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
