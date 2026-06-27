import { useEffect, useState } from 'react';
import { MISSIONS } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { fetchLeaderboard, type LeaderboardEntry } from '@/services/apiService';
import { SoundManager } from '@/game/systems/SoundManager';

export function LeaderboardScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const [missionId, setMissionId] = useState(MISSIONS[0].id);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchLeaderboard(missionId)
      .then(setEntries)
      .catch(() => setError('Could not load leaderboard. Is the server running?'))
      .finally(() => setLoading(false));
  }, [missionId]);

  const mission = MISSIONS.find((m) => m.id === missionId);
  const personalBest = save.bestScores[missionId];

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
        <h2 className="font-display text-2xl text-desert-gold">Leaderboard</h2>
        <div className="w-16" />
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 p-8">
        <label className="mb-6 block">
          <span className="mb-2 block text-sm text-white/60">Mission</span>
          <select
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-white"
          >
            {MISSIONS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        {personalBest !== undefined && (
          <p className="mb-4 text-sm text-desert-gold">
            Your best: {personalBest} {mission && `(★${mission.difficulty})`}
          </p>
        )}

        {loading && <p className="text-white/50">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p className="text-white/50">No scores yet. Be the first!</p>
        )}

        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.email}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold ${entry.rank <= 3 ? 'text-desert-gold' : 'text-white/50'}`}>
                  #{entry.rank}
                </span>
                <span className="text-white/80">{entry.email}</span>
              </div>
              <span className="font-semibold text-desert-gold">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
