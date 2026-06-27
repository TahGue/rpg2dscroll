import { useState } from 'react';
import type { DialogLine } from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

interface DialogSystemProps {
  lines: DialogLine[];
  onComplete: () => void;
}

export function DialogSystem({ lines, onComplete }: DialogSystemProps) {
  const [index, setIndex] = useState(0);
  const line = lines[index];

  if (!line) {
    onComplete();
    return null;
  }

  const advance = () => {
    SoundManager.play('click');
    if (index >= lines.length - 1) {
      onComplete();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/50 p-6 backdrop-blur-sm">
      <button
        type="button"
        onClick={advance}
        className="w-full max-w-2xl rounded-xl border border-desert-gold/40 bg-desert-night/95 p-6 text-left text-white shadow-2xl"
      >
        <p className="mb-2 text-sm font-semibold text-desert-gold">{line.speaker}</p>
        <p className="text-base leading-relaxed text-white/90">{line.text}</p>
        <p className="mt-4 text-xs text-white/40">
          {index + 1} / {lines.length} · Click to continue
        </p>
      </button>
    </div>
  );
}
