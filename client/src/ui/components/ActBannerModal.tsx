import { getActById } from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

export function ActBannerModal({ actId, onDismiss }: { actId: string; onDismiss: () => void }) {
  const act = getActById(actId);
  if (!act) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-desert-gold/50 bg-gradient-to-b from-desert-night to-black p-10 text-center text-white shadow-2xl">
        <p className="mb-2 text-sm uppercase tracking-[0.35em] text-desert-ember">{act.subtitle}</p>
        <h2 className="font-display mb-6 text-4xl text-desert-gold">{act.title}</h2>
        <p className="mb-8 leading-relaxed text-white/70">{act.description}</p>
        <button
          type="button"
          onClick={() => { SoundManager.play('click'); onDismiss(); }}
          className="rounded-lg bg-desert-gold px-10 py-3 font-semibold text-desert-night hover:bg-yellow-400"
        >
          Continue Journey
        </button>
      </div>
    </div>
  );
}
