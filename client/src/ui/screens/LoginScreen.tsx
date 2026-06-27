import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { login, register, fetchCloudSave, pushCloudSave, setAuthToken } from '@/services/apiService';
import { mergeCloudSaves } from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

export function LoginScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const setAuthEmail = useGameStore((s) => s.setAuthEmail);
  const loadSaveData = useGameStore((s) => s.loadSaveData);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    SoundManager.play('click');

    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(email, password);

      setAuthToken(result.token);
      setAuthEmail(result.email);

      const cloudSave = await fetchCloudSave();
      const localSave = useGameStore.getState().save;
      const merged = mergeCloudSaves(localSave, cloudSave);
      loadSaveData(merged);
      void pushCloudSave(merged).catch(() => {});

      setScreen('main_menu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    SoundManager.play('click');
    setAuthToken(null);
    setAuthEmail(null);
    setScreen('main_menu');
  };

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-desert-dusk to-desert-night">
      <div className="w-full max-w-md rounded-2xl border border-desert-gold/30 bg-black/50 p-8 text-white">
        <h2 className="font-display mb-2 text-center text-3xl text-desert-gold">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="mb-6 text-center text-sm text-white/50">Cloud save your desert adventure</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:border-desert-gold focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:border-desert-gold focus:outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-desert-gold py-3 font-semibold text-desert-night disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="mt-4 w-full text-sm text-white/50 hover:text-desert-gold"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>

        <div className="my-6 border-t border-white/10" />

        <button
          type="button"
          onClick={handleGuest}
          className="w-full rounded-lg border border-white/30 py-3 text-white/70 hover:bg-white/5"
        >
          Play as Guest (local save)
        </button>

        <button
          type="button"
          onClick={() => setScreen('main_menu')}
          className="mt-3 w-full text-sm text-white/40 hover:text-white/60"
        >
          ← Back to menu
        </button>
      </div>
    </div>
  );
}
