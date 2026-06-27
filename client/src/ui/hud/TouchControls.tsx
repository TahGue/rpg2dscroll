import { InputBridge, type TouchAction } from '@/game/systems/InputBridge';
import { getBuildDefinition } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '@/game/systems/SoundManager';

export function TouchControls() {
  const sandSlashUnlocked = useGameStore((s) => s.mission.sandSlashUnlocked);
  const bowUnlocked = useGameStore((s) => s.mission.bowUnlocked);
  const spearUnlocked = useGameStore((s) => s.mission.spearUnlocked);
  const warCryUnlocked = useGameStore((s) => s.mission.warCryUnlocked);
  const sentinelUnlocked = useGameStore((s) => s.mission.sentinelUnlocked);
  const lionUnlocked = useGameStore((s) => s.save.upgrades.lion_level ?? 0) >= 1;
  const isAmbush = useGameStore((s) => s.mission.isAmbush);
  const selectedBuild = useGameStore((s) => s.save.selectedBuild);
  const buildName = getBuildDefinition(selectedBuild)?.name ?? 'Tower';

  const bindHeld = (action: 'left' | 'right' | 'block' | 'repair') => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      InputBridge.setHeld(action, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      InputBridge.setHeld(action, false);
    },
  });

  const bindPulse = (action: TouchAction) => () => {
    SoundManager.play('click');
    InputBridge.pulse(action);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 md:hidden">
      <div className="pointer-events-auto absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <TouchBtn label="←" {...bindHeld('left')} />
          <TouchBtn label="→" {...bindHeld('right')} />
        </div>
        <TouchBtn label="↑" onClick={bindPulse('jump')} />
      </div>

      <div className="pointer-events-auto absolute bottom-4 right-4 grid grid-cols-3 gap-2">
        <TouchBtn label="⚔" onClick={bindPulse('attack')} />
        <TouchBtn label="🛡" {...bindHeld('block')} />
        <TouchBtn label="💨" onClick={bindPulse('dodge')} />
        <TouchBtn label="💥" onClick={bindPulse('bash')} />
        {sandSlashUnlocked ? (
          <TouchBtn label="🌪" onClick={bindPulse('slash')} />
        ) : (
          <div />
        )}
        {bowUnlocked ? (
          <TouchBtn label="🏹" onClick={bindPulse('bow')} />
        ) : spearUnlocked ? (
          <TouchBtn label="🔱" onClick={bindPulse('spear')} />
        ) : (
          <div />
        )}
        {bowUnlocked && spearUnlocked ? (
          <TouchBtn label="🔱" onClick={bindPulse('spear')} />
        ) : null}
        {warCryUnlocked ? (
          <TouchBtn label="☀" onClick={bindPulse('war_cry')} />
        ) : sentinelUnlocked ? (
          <TouchBtn label="✦" onClick={bindPulse('sentinel')} />
        ) : (
          <div />
        )}
        {warCryUnlocked && sentinelUnlocked ? (
          <TouchBtn label="✦" onClick={bindPulse('sentinel')} />
        ) : null}
        <TouchBtn label="🔧" {...bindHeld('repair')} />
        {!isAmbush && (
          <>
            <TouchBtn label="🏗" onClick={bindPulse('build')} />
            <TouchBtn label="↻" onClick={bindPulse('cycle_build')} />
          </>
        )}
        {!isAmbush && (
          <p className="col-span-3 text-center text-[9px] text-white/50">{buildName}</p>
        )}
        {lionUnlocked ? (
          <TouchBtn label="🦁" onClick={bindPulse('roar')} className="col-span-3" />
        ) : null}
      </div>
    </div>
  );
}

function TouchBtn({
  label,
  className = '',
  onClick,
  onTouchStart,
  onTouchEnd,
}: {
  label: string;
  className?: string;
  onClick?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/50 text-lg text-white backdrop-blur active:bg-desert-gold/30 ${className}`}
    >
      {label}
    </button>
  );
}
