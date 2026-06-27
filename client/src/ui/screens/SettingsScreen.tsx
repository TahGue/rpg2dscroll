import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_KEY_BINDINGS,
  DEFAULT_SETTINGS,
  CONTROL_ACTION_LABELS,
  formatKeyLabel,
  keyboardEventToPhaserKey,
  type ControlAction,
  type GameSettings,
} from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';
import { MusicManager } from '@/game/systems/MusicManager';
import { downloadSaveFile } from '@/services/saveService';

export function SettingsScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const authEmail = useGameStore((s) => s.authEmail);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetSave = useGameStore((s) => s.resetSave);
  const syncToCloud = useGameStore((s) => s.syncToCloud);
  const importSaveFromJson = useGameStore((s) => s.importSaveFromJson);
  const logout = useGameStore((s) => s.logout);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState<ControlAction | null>(null);
  const [bindError, setBindError] = useState<string | null>(null);

  useEffect(() => {
    if (!listening) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'Escape') {
        setListening(null);
        setBindError(null);
        return;
      }

      const key = keyboardEventToPhaserKey(e);
      const conflict = (Object.keys(save.settings.keyBindings) as ControlAction[]).find(
        (action) => action !== listening && save.settings.keyBindings[action] === key,
      );
      if (conflict) {
        setBindError(`Already used by ${CONTROL_ACTION_LABELS[conflict]}`);
        return;
      }

      updateSettings({
        keyBindings: { ...save.settings.keyBindings, [listening]: key },
      });
      SoundManager.play('click');
      setBindError(null);
      setListening(null);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listening, save.settings.keyBindings, updateSettings]);

  const handleChange = (key: keyof GameSettings, value: number | boolean) => {
    updateSettings({ [key]: value });
    if (key === 'musicVolume' && typeof value === 'number') {
      MusicManager.updateVolume();
    }
    if (key === 'sfxVolume' && typeof value === 'number' && value > 0) {
      SoundManager.play('click');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      resetSave();
      SoundManager.play('click');
    }
  };

  const handleExport = () => {
    downloadSaveFile(save);
    SoundManager.play('click');
  };

  const handleImport = async (file: File) => {
    try {
      const raw = await file.text();
      if (
        window.confirm(
          'Import this save file? Current local progress will be replaced with the imported data.',
        )
      ) {
        const ok = importSaveFromJson(raw);
        if (ok) {
          SoundManager.play('click');
          alert('Save imported successfully.');
        } else {
          alert('Invalid save file.');
        }
      }
    } catch {
      alert('Could not read the file.');
    }
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleSync = async () => {
    try {
      await syncToCloud();
      SoundManager.play('click');
      alert('Progress synced to cloud.');
    } catch {
      alert('Sync failed. Is the server running?');
    }
  };

  const handleLogout = () => {
    logout();
    SoundManager.play('click');
    setScreen('main_menu');
  };

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); setScreen('main_menu'); }}
          className="text-white/60 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Settings</h2>
        <div className="w-16" />
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-8 overflow-auto p-8">
        <SettingSlider
          label="Music Volume"
          value={save.settings.musicVolume}
          onChange={(v) => handleChange('musicVolume', v)}
        />
        <SettingSlider
          label="SFX Volume"
          value={save.settings.sfxVolume}
          onChange={(v) => handleChange('sfxVolume', v)}
        />

        <label className="flex items-center justify-between">
          <span className="text-white/80">Show damage numbers</span>
          <input
            type="checkbox"
            checked={save.settings.showDamageNumbers}
            onChange={(e) => handleChange('showDamageNumbers', e.target.checked)}
            className="h-5 w-5 accent-desert-gold"
          />
        </label>

        <div>
          <p className="mb-3 text-sm font-semibold text-desert-gold">Controls</p>
          <p className="mb-3 text-xs text-white/40">
            Arrow keys still work for movement. Space also jumps unless bound elsewhere. Rebinds apply on the next mission. Press Escape to cancel.
          </p>
          {bindError && <p className="mb-2 text-xs text-red-400">{bindError}</p>}
          <div className="space-y-2">
            {(Object.keys(CONTROL_ACTION_LABELS) as ControlAction[]).map((action) => (
              <div key={action} className="flex items-center justify-between rounded border border-white/10 px-3 py-2">
                <span className="text-sm text-white/70">{CONTROL_ACTION_LABELS[action]}</span>
                <button
                  type="button"
                  onClick={() => {
                    setBindError(null);
                    setListening(action);
                  }}
                  className={`min-w-[4rem] rounded border px-3 py-1 text-sm ${
                    listening === action
                      ? 'border-desert-gold bg-desert-gold/20 text-desert-gold'
                      : 'border-white/20 text-white/80'
                  }`}
                >
                  {listening === action ? '…' : formatKeyLabel(save.settings.keyBindings[action])}
                </button>
              </div>
            ))}
          </div>
        </div>

        {authEmail && (
          <div className="rounded-lg border border-desert-gold/30 bg-black/30 p-4">
            <p className="mb-2 text-sm text-white/60">Cloud account</p>
            <p className="mb-3 text-desert-gold">{authEmail}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSync}
                className="flex-1 rounded-lg border border-desert-gold/50 py-2 text-sm text-desert-gold hover:bg-desert-gold/10"
              >
                Sync Now
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-lg border border-white/20 py-2 text-sm text-white/60 hover:bg-white/5"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-6">
          <p className="mb-2 text-sm text-white/50">Progress</p>
          <p className="mb-4 text-sm text-white/70">
            Level {save.level} · {save.gold} gold · {save.water} water · {save.completedMissions.length} missions
            {save.ngPlusLevel > 0 && ` · NG+ ${save.ngPlusLevel}`}
          </p>
          <p className="mb-4 text-xs text-white/40">
            Materials: {save.iron} iron · {save.leather} leather · {save.wood} wood
          </p>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 rounded-lg border border-desert-gold/50 py-2 text-sm text-desert-gold hover:bg-desert-gold/10"
            >
              Export Save
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex-1 rounded-lg border border-white/20 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Import Save
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-lg border border-red-500/50 py-3 text-red-400 hover:bg-red-500/10"
          >
            Reset Save Data
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            updateSettings({ keyBindings: { ...DEFAULT_KEY_BINDINGS } })
          }
          className="w-full text-sm text-white/40 hover:text-white/60"
        >
          Reset controls to defaults
        </button>

        <button
          type="button"
          onClick={() => updateSettings(DEFAULT_SETTINGS)}
          className="w-full text-sm text-white/40 hover:text-white/60"
        >
          Restore all default settings
        </button>
      </div>
    </div>
  );
}

function SettingSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-desert-gold">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-desert-gold"
      />
    </label>
  );
}
