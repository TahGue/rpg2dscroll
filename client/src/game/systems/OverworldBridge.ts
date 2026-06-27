import type { OverworldPOI, OverworldPatrol } from '@malik/shared';
import {
  getInitialExploredCells,
  getNewExploredCellsNearPoint,
  getOverworldRegion,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { persistSave } from '@/services/saveService';

const PERSIST_INTERVAL_MS = 2000;
const SAVE_POSITION_INTERVAL_MS = 400;

export class OverworldBridge {
  private static lastPersistMs = 0;
  private static lastSavePosMs = 0;

  private static persistIfDue(save: ReturnType<typeof useGameStore.getState>['save'], force = false): void {
    const now = Date.now();
    if (!force && now - this.lastPersistMs < PERSIST_INTERVAL_MS) return;
    this.lastPersistMs = now;
    persistSave(save);
  }

  static flushSave(): void {
    this.persistIfDue(useGameStore.getState().save, true);
  }

  static syncPosition(regionId: string, x: number, y: number, force = false): void {
    const rx = Math.round(x);
    const ry = Math.round(y);
    useGameStore.setState({ overworldLivePosition: { x: rx, y: ry } });

    const now = Date.now();
    if (now - this.lastSavePosMs < SAVE_POSITION_INTERVAL_MS && !force) return;
    this.lastSavePosMs = now;

    const save = useGameStore.getState().save;
    const updated = {
      ...save,
      overworldPosition: { regionId, x: rx, y: ry },
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated);
  }

  static ensureExploredSeed(regionId: string): void {
    const save = useGameStore.getState().save;
    if (save.exploredOverworldCells.length > 0) return;
    const region = getOverworldRegion(regionId);
    const updated = {
      ...save,
      exploredOverworldCells: getInitialExploredCells(region),
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated, true);
  }

  static exploreCells(regionId: string, x: number, y: number): string[] {
    const save = useGameStore.getState().save;
    const added = getNewExploredCellsNearPoint(regionId, x, y, save.exploredOverworldCells);
    if (added.length === 0) return [];
    const updated = {
      ...save,
      exploredOverworldCells: [...save.exploredOverworldCells, ...added],
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated);
    return added;
  }

  static revealPOIAreas(regionId: string, pois: OverworldPOI[]): void {
    const save = useGameStore.getState().save;
    let cells = save.exploredOverworldCells;
    let addedAny = false;
    for (const poi of pois) {
      const added = getNewExploredCellsNearPoint(regionId, poi.x, poi.y, cells, poi.radius + 60);
      if (added.length > 0) {
        cells = [...cells, ...added];
        addedAny = true;
      }
    }
    if (!addedAny) return;
    const updated = { ...save, exploredOverworldCells: [...new Set(cells)] };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated);
  }

  static markPOIVisited(poiId: string): void {
    const save = useGameStore.getState().save;
    if (save.visitedOverworldPOIs.includes(poiId)) return;
    const updated = {
      ...save,
      visitedOverworldPOIs: [...save.visitedOverworldPOIs, poiId],
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated, true);
  }

  static setInteractPrompt(text: string | null, poi: OverworldPOI | null): void {
    useGameStore.getState().setOverworldInteract({ prompt: text, poiId: poi?.id ?? null, poi });
  }

  static openNpcDialog(npcId: string, lines: string[], name: string): void {
    useGameStore.getState().setOverworldDialog({ npcId, name, lines });
  }

  static offerMission(missionId: string, title: string, brief: string, returnX: number, returnY: number): void {
    void missionId;
    void brief;
    void returnX;
    void returnY;
    useGameStore.getState().setOverworldDialog({
      npcId: 'closed-defense-route',
      name: title,
      lines: ['That old defense route is closed. Malik now handles danger directly in the top-down desert.'],
    });
  }

  static offerPatrolAmbush(patrol: OverworldPatrol, returnX: number, returnY: number): void {
    void returnX;
    void returnY;
    useGameStore.getState().setOverworldDialog({
      npcId: patrol.id,
      name: patrol.label,
      lines: [patrol.ambushBrief ?? 'Ambush!', 'Fight threats directly in the top-down adventure world.'],
    });
  }

  static openCampHub(): void {
    useGameStore.getState().setOverworldCampOpen(true);
  }

  static completeEvent(poiId: string, gold: number, loreId?: string): boolean {
    const save = useGameStore.getState().save;
    if (save.completedOverworldEvents.includes(poiId)) return false;
    const updated = {
      ...save,
      gold: save.gold + gold,
      completedOverworldEvents: [...save.completedOverworldEvents, poiId],
      unlockedLore: loreId && !save.unlockedLore.includes(loreId)
        ? [...save.unlockedLore, loreId]
        : save.unlockedLore,
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated, true);
    return true;
  }

  static grantChest(poiId: string, gold: number, iron: number): boolean {
    const save = useGameStore.getState().save;
    if (save.openedOverworldChests.includes(poiId)) return false;
    const updated = {
      ...save,
      gold: save.gold + gold,
      iron: save.iron + iron,
      inventory: { ...save.inventory },
      openedOverworldChests: [...save.openedOverworldChests, poiId],
    };
    useGameStore.setState({ save: updated });
    this.persistIfDue(updated, true);
    return true;
  }

  static travelToRegion(targetRegionId: string, targetX: number, targetY: number): void {
    useGameStore.getState().travelToOverworldRegion(targetRegionId, targetX, targetY);
  }
}
