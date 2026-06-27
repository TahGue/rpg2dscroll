import {
  MAP_PATHS,
  getMapPathState,
  getMapPosition,
} from '@malik/shared';
import type { LocalSaveData } from '@malik/shared';

interface MapPathDustProps {
  save: LocalSaveData;
}

/** Animated dust motes drifting along unlocked primary caravan routes. */
export function MapPathDust({ save }: MapPathDustProps) {
  const primaryPaths = MAP_PATHS.filter((p) => p.primary);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {primaryPaths.map(({ from, to }) => {
        const state = getMapPathState(from, to, save);
        if (state === 'locked') return null;

        const p1 = getMapPosition(from);
        const p2 = getMapPosition(to);
        const pathId = `dust-path-${from}-${to}`;

        return (
          <g key={pathId}>
            <path
              id={pathId}
              d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              fill="none"
              stroke="none"
            />
            {[0, 1.8, 3.6].map((begin, i) => (
              <circle key={i} r="0.35" fill={state === 'completed' ? '#f0d78c' : '#c4a35a'} opacity="0.7">
                <animateMotion
                  dur={`${3.5 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${begin}s`}
                  path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                />
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
