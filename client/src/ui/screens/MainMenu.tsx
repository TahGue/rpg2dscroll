import { getXpProgress } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const save = useGameStore((s) => s.save);
  const authEmail = useGameStore((s) => s.authEmail);
  const xpProgress = getXpProgress(save.xp, save.level);

  const navigate = (screen: 'world_explore' | 'upgrade' | 'camp_upgrades' | 'relic_upgrades' | 'inventory' | 'post_game' | 'settings' | 'login' | 'leaderboard' | 'achievements' | 'lore') => {
    SoundManager.play('click');
    setScreen(screen);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-desert-dusk to-desert-night text-white">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 20%, #d4a843 0%, transparent 40%)',
        }}
      />

      <div className="relative z-10 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-desert-gold/80">Pixel-Art Adventure RPG</p>
        <h1 className="font-display mb-2 text-6xl font-bold text-desert-gold">Malik</h1>
        <p className="mb-6 text-lg text-white/70">Guardian of the Dunes</p>

        <div className="mx-auto mb-8 w-64">
          <div className="mb-1 flex justify-between text-xs text-white/60">
            <span>Level {save.level}</span>
            <span>{save.gold} gold</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full bg-desert-gold transition-all"
              style={{ width: `${xpProgress.pct}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-white/40">
            {xpProgress.current} / {xpProgress.needed} XP
            {save.ngPlusLevel > 0 && (
              <span className="ml-2 text-amber-300">· NG+ {save.ngPlusLevel}</span>
            )}
          </p>
          {(save.iron > 0 || save.leather > 0 || save.wood > 0 || save.water > 0) && (
            <p className="mt-1 text-[10px] text-white/35">
              {save.water > 0 && `${save.water} water · `}
              {save.iron > 0 && `${save.iron} iron · `}
              {save.leather > 0 && `${save.leather} leather · `}
              {save.wood > 0 && `${save.wood} wood`}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <MenuButton onClick={() => navigate('world_explore')}>Begin Adventure</MenuButton>
          <MenuButton onClick={() => navigate('upgrade')} variant="secondary">Upgrades</MenuButton>
          <MenuButton onClick={() => navigate('camp_upgrades')} variant="secondary">Camp Upgrades</MenuButton>
          <MenuButton onClick={() => navigate('relic_upgrades')} variant="secondary">Sentinel Relics</MenuButton>
          <MenuButton onClick={() => navigate('inventory')} variant="secondary">Inventory</MenuButton>
          {save.campaignComplete && (
            <MenuButton onClick={() => navigate('post_game')} variant="secondary">New Game+</MenuButton>
          )}
          <MenuButton onClick={() => navigate('settings')} variant="secondary">Settings</MenuButton>
          <MenuButton onClick={() => navigate('leaderboard')} variant="secondary">Leaderboard</MenuButton>
          <MenuButton onClick={() => navigate('achievements')} variant="secondary">Achievements</MenuButton>
          <MenuButton onClick={() => navigate('lore')} variant="secondary">Desert Lore</MenuButton>
          <MenuButton onClick={() => navigate('login')} variant="secondary">
            {authEmail ? `Account: ${authEmail}` : 'Cloud Save / Login'}
          </MenuButton>
        </div>

        <p className="mt-12 text-xs text-white/40">
          Explore: WASD move · E interact · J attack · O bow · Gather, craft, quest, and fight
        </p>
        <p className="mt-1 text-[10px] text-white/30">Demo: Nahran Village → Palm Grove → Oasis Road → Bandit Camp → Small Cave</p>
      </div>
    </div>
  );
}

function MenuButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const base = 'min-w-[220px] rounded-lg px-8 py-3 text-lg font-semibold transition-all hover:scale-105';
  const styles =
    variant === 'primary'
      ? 'bg-desert-gold text-desert-night hover:bg-yellow-400'
      : 'border border-desert-gold/50 text-desert-gold hover:bg-desert-gold/10';

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  );
}
