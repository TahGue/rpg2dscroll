import { OverworldInput, type MoveDir } from '@/game/systems/OverworldInput';

function bindHeld(dir: MoveDir) {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      OverworldInput.setHeld(dir, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      OverworldInput.setHeld(dir, false);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      OverworldInput.setHeld(dir, false);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      OverworldInput.setHeld(dir, false);
    },
  };
}

interface OverworldTouchControlsProps {
  onOpenMap?: () => void;
  onOpenCamp?: () => void;
}

export function OverworldTouchControls({ onOpenMap, onOpenCamp }: OverworldTouchControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 md:hidden">
      <div className="pointer-events-auto absolute left-3 top-20 flex gap-2">
        {onOpenCamp && (
          <QuickBtn label="Camp" onClick={onOpenCamp} />
        )}
        {onOpenMap && (
          <QuickBtn label="Map" onClick={onOpenMap} />
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-20 left-4 flex flex-col items-center gap-1.5">
        <TouchBtn label="↑" {...bindHeld('up')} />
        <div className="flex gap-2">
          <TouchBtn label="←" {...bindHeld('left')} />
          <TouchBtn label="↓" {...bindHeld('down')} />
          <TouchBtn label="→" {...bindHeld('right')} />
        </div>
      </div>
      <button
        type="button"
        className="pointer-events-auto absolute bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-desert-gold/50 bg-black/60 text-sm font-bold text-desert-gold active:bg-desert-gold/20"
        onPointerDown={(e) => {
          e.preventDefault();
          OverworldInput.pulseInteract();
        }}
      >
        E
      </button>
    </div>
  );
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-desert-gold/40 bg-black/65 px-3 py-2 text-xs font-semibold text-desert-gold active:bg-desert-gold/15"
    >
      {label}
    </button>
  );
}

function TouchBtn({
  label,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: {
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-black/55 text-lg text-white active:bg-desert-gold/20"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
    >
      {label}
    </button>
  );
}
