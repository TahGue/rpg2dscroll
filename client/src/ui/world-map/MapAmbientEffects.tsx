import { getMapPosition, getMapNodeState } from '@malik/shared';
import type { LocalSaveData } from '@malik/shared';

const OASIS_NODES = ['silent-oasis', 'wood-grove', 'hidden-cistern'];
const BOSS_NODES = ['broken-watchtower', 'black-eclipse-gate', 'shadow-emir-fortress'];

interface MapAmbientEffectsProps {
  save: LocalSaveData;
  currentNodeId: string;
}

export function MapAmbientEffects({ save, currentNodeId }: MapAmbientEffectsProps) {
  return (
    <>
      {OASIS_NODES.map((id) => {
        const state = getMapNodeState(id, save, currentNodeId);
        if (state === 'locked') return null;
        const pos = getMapPosition(id);
        return (
          <div
            key={`oasis-${id}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            aria-hidden
          >
            <div className="h-14 w-14 animate-pulse rounded-full bg-teal-400/20 blur-md" />
          </div>
        );
      })}

      {BOSS_NODES.map((id) => {
        const state = getMapNodeState(id, save, currentNodeId);
        if (state === 'locked') return null;
        const pos = getMapPosition(id);
        return (
          <div
            key={`boss-${id}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y - 4}%` }}
            aria-hidden
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-red-900/30 blur-lg" />
            <div
              className="absolute left-1/2 top-0 h-8 w-1 -translate-x-1/2 rounded-full bg-red-950/40 blur-sm map-boss-smoke"
            />
          </div>
        );
      })}
    </>
  );
}
