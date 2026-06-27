export interface OverworldMapRoadRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const NAHRAN_ROADS: OverworldMapRoadRect[] = [
  { x: 440, y: 1180, w: 720, h: 48 },
  { x: 700, y: 520, w: 48, h: 720 },
  { x: 900, y: 480, w: 400, h: 48 },
  { x: 1500, y: 880, w: 48, h: 200 },
  { x: 1040, y: 180, w: 48, h: 360 },
  { x: 220, y: 600, w: 320, h: 48 },
  { x: 1180, y: 1240, w: 48, h: 320 },
];

const SCORPION_VALLEY_ROADS: OverworldMapRoadRect[] = [
  { x: 580, y: 0, w: 48, h: 320 },
  { x: 580, y: 280, w: 480, h: 48 },
  { x: 300, y: 320, w: 48, h: 360 },
  { x: 960, y: 320, w: 48, h: 900 },
  { x: 960, y: 1160, w: 120, h: 48 },
  { x: 1680, y: 800, w: 200, h: 48 },
  { x: 1760, y: 820, w: 48, h: 200 },
];

const BLACK_ECLIPSE_ROADS: OverworldMapRoadRect[] = [
  { x: 220, y: 700, w: 280, h: 48 },
  { x: 480, y: 520, w: 48, h: 240 },
  { x: 480, y: 660, w: 540, h: 48 },
  { x: 980, y: 660, w: 48, h: 120 },
  { x: 1020, y: 640, w: 500, h: 48 },
];

export const OVERWORLD_MAP_ROADS: Record<string, OverworldMapRoadRect[]> = {
  'nahran-outskirts': NAHRAN_ROADS,
  'scorpion-valley': SCORPION_VALLEY_ROADS,
  'black-eclipse-rim': BLACK_ECLIPSE_ROADS,
};

export function getOverworldMapRoads(regionId: string): OverworldMapRoadRect[] {
  return OVERWORLD_MAP_ROADS[regionId] ?? [];
}
