import { useGameStore } from '@/store/gameStore';
import { getBuildDefinition } from '@malik/shared';
import { buildMissionControlHints } from '@/game/utils/controlHints';
import { SoundManager } from '@/game/systems/SoundManager';

interface MissionHUDProps {
  onExit: () => void;
}

export function MissionHUD({ onExit }: MissionHUDProps) {
  const mission = useGameStore((s) => s.mission);
  const save = useGameStore((s) => s.save);
  const selectedBuild = save.selectedBuild;
  const togglePause = useGameStore((s) => s.togglePause);
  const buildName = getBuildDefinition(selectedBuild)?.name ?? 'Arrow Tower';
  const controlHints = buildMissionControlHints(save.settings.keyBindings, {
    sandSlashUnlocked: mission.sandSlashUnlocked,
    bowUnlocked: mission.bowUnlocked,
    spearUnlocked: mission.spearUnlocked,
    warCryUnlocked: mission.warCryUnlocked,
    sentinelUnlocked: mission.sentinelUnlocked,
    isAmbush: mission.isAmbush,
  });
  const bossPct = mission.bossMaxHp > 0 ? (mission.bossHp / mission.bossMaxHp) * 100 : 0;

  const playerPct = (mission.playerHp / mission.playerMaxHp) * 100;
  const gatePct = mission.gateMaxHp > 0 ? (mission.gateHp / mission.gateMaxHp) * 100 : 0;

  const handlePause = () => {
    SoundManager.play('click');
    togglePause();
  };

  const handleExit = () => {
    SoundManager.play('click');
    onExit();
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <div className="pointer-events-auto">
          <Bar label="Malik" value={playerPct} color="bg-red-500" text={`${Math.round(mission.playerHp)}/${mission.playerMaxHp}`} />
          {!mission.isAmbush && (
            <Bar
              label={mission.isCaravan ? 'Caravan' : mission.isOasis ? 'Well' : mission.isShrine ? 'Shrine' : 'Gate'}
              value={gatePct}
              color="bg-desert-gold"
              text={`${Math.round(mission.gateHp)}/${mission.gateMaxHp}`}
            />
          )}
          {mission.bossMaxHp > 0 && mission.bossName && (
            <Bar
              label={mission.bossName}
              value={bossPct}
              color="bg-purple-600"
              text={`${Math.round(mission.bossHp)}/${mission.bossMaxHp}`}
            />
          )}
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={handlePause}
            className="rounded border border-white/30 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
          >
            {mission.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={handleExit}
            className="rounded border border-white/30 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
          >
            Exit
          </button>
        </div>
      </div>

      {mission.isPaused && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-desert-gold/40 bg-desert-night/90 px-12 py-8 text-center">
            <h3 className="font-display mb-4 text-3xl text-desert-gold">Paused</h3>
            <button
              type="button"
              onClick={handlePause}
              className="rounded-lg bg-desert-gold px-8 py-2 font-semibold text-desert-night"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center px-4">
        {mission.objective && (
          <p className="max-w-xl rounded-lg bg-black/40 px-4 py-1 text-center text-xs text-white/70 backdrop-blur">
            {mission.objective}
            {mission.activeBoost && (
              <span className="ml-2 text-cyan-300">
                · {mission.activeBoost === 'hp' ? '+25% HP' : mission.activeBoost === 'damage' ? '+20% dmg' : '2× repair'}
              </span>
            )}
            {mission.isOasis && (
              <span className="ml-2 text-teal-300">· well heals Malik nearby</span>
            )}
            {(mission.missionId === 'mission-black-eclipse' ||
              mission.missionId === 'mission-shadow-emir') && (
              <span className="ml-2 text-indigo-300">· relic light near gate</span>
            )}
            {mission.isCaravan && mission.betweenWaves && (
              <span className="ml-2 text-amber-300">· caravan rolling</span>
            )}
          </p>
        )}
      </div>

      <div className="mb-36 flex items-end justify-between text-sm text-white/80 md:mb-0">
        <div className="rounded-lg bg-black/50 px-4 py-2 backdrop-blur">
          <p>
            Wave{' '}
            <span className="font-bold text-desert-gold">
              {mission.currentWave || '—'}
              {mission.totalWaves > 0 ? ` / ${mission.totalWaves}` : ''}
            </span>
          </p>
          <p>
            Enemies <span className="font-bold">{mission.enemiesRemaining}</span>
          </p>
          {mission.betweenWaves && (
            <p className="text-xs text-green-300">Break — repair or build</p>
          )}
          {mission.preparing && (
            <p className="text-xs text-cyan-300">Prepare — build & repair!</p>
          )}
          {!mission.isAmbush && (
            <p className="text-[10px] text-white/50">
              Build: <span className="text-desert-gold">{buildName}</span>
            </p>
          )}
          {mission.bossPhase > 0 && mission.bossName && (
            <p className="text-[10px] text-purple-300">Boss phase {mission.bossPhase + 1}</p>
          )}
          {mission.missionId === 'mission-red-dune-pass' && (
            <p className="text-[10px] text-amber-200/80">Wind gusts in mid-pass</p>
          )}
          {mission.isSurvive && mission.surviveDurationMs > 0 && (
            <p>
              Sunrise{' '}
              <span className="font-bold text-amber-300">
                {formatTime(Math.max(0, mission.surviveDurationMs - mission.elapsedMs))}
              </span>
            </p>
          )}
          <p className="text-[10px] text-white/40">{formatTime(mission.elapsedMs)}</p>
        </div>
        <div className="hidden rounded-lg bg-black/50 px-4 py-2 text-center backdrop-blur md:block">
          <p>
            Gold <span className="font-bold text-desert-gold">{mission.goldCollected}</span>
          </p>
          <p className="mt-1 text-[10px] text-white/40">{controlHints}</p>
          <SkillBar label="Bash" pct={mission.shieldBashCooldown} color="bg-cyan-400" />
          <SkillBar label="Dodge" pct={mission.dodgeCooldown} color="bg-green-400" />
          {mission.sandSlashUnlocked && (
            <SkillBar label="Slash" pct={mission.sandSlashCooldown} color="bg-amber-400" />
          )}
          {mission.bowUnlocked && (
            <SkillBar label="Bow" pct={mission.bowCooldown} color="bg-yellow-300" />
          )}
          {mission.spearUnlocked && (
            <SkillBar label="Spear" pct={mission.spearCooldown} color="bg-slate-300" />
          )}
          {mission.warCryUnlocked && (
            <SkillBar label="War Cry" pct={mission.warCryCooldown} color="bg-orange-400" />
          )}
          {mission.sentinelUnlocked && (
            <SkillBar label="Sentinel" pct={mission.sentinelCooldown} color="bg-sky-400" />
          )}
        </div>
        <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur md:hidden">
          <p>
            Gold <span className="font-bold text-desert-gold">{mission.goldCollected}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SkillBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mt-1">
      <div className="h-1 w-24 overflow-hidden rounded-full bg-black/50">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="text-[9px] text-white/30">{label}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  color,
  text,
}: {
  label: string;
  value: number;
  color: string;
  text: string;
}) {
  return (
    <div className="mb-2 w-48">
      <div className="mb-1 flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span>{text}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/50">
        <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${Math.max(0, value)}%` }} />
      </div>
    </div>
  );
}
