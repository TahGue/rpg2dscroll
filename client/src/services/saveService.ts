import { DEFAULT_SAVE, SAVE_KEY, mergeSaveData, type LocalSaveData } from '@malik/shared';

export function loadSave(): LocalSaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return mergeSaveData(JSON.parse(raw) as Partial<LocalSaveData>);
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function persistSave(data: LocalSaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...data, lastPlayedAt: new Date().toISOString() }));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function exportSaveJson(save: LocalSaveData): string {
  return JSON.stringify(save, null, 2);
}

export function downloadSaveFile(save: LocalSaveData): void {
  const blob = new Blob([exportSaveJson(save)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `malik-save-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedSave(raw: string): LocalSaveData {
  const parsed = JSON.parse(raw) as Partial<LocalSaveData>;
  if (typeof parsed.version !== 'number') {
    throw new Error('Invalid save file');
  }
  return mergeSaveData(parsed);
}
