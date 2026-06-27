import { useGameStore } from '@/store/gameStore';
import { getBuildDefinition, getDefenseLayout, getDefender, getHero, getWaveStartHint, getWaveStartLabel, LION_MODE_LABELS, BATTLE_POST_LABELS, DEFENDER_POST_LABELS, type BattlePost, type DefenderPost, type LionMode } from '@malik/shared';
import { buildMissionControlHints } from '@/game/utils/controlHints';
import { SoundManager } from '@/game/systems/SoundManager';
import { MissionControlBridge } from '@/game/systems/MissionControlBridge';

interface MissionHUDProps {
  onExit: () => void;
}

export function MissionHUD({ onExit }: MissionHUDProps) {
  const mission = useGameStore((s) => s.mission);
  const save = useGameStore((s) => s.save);
  const setLionMode = useGameStore((s) => s.setLionMode);
  const setMissionPosts = useGameStore((s) => s.setMissionPosts);
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
  const waveStartLabel = getWaveStartLabel({
    currentWave: mission.currentWave,
    totalWaves: mission.totalWaves,
    isAmbush: mission.isAmbush,
    betweenWaves: mission.betweenWaves,
  });
  const waveStartHint = getWaveStartHint({
    currentWave: mission.currentWave,
    totalWaves: mission.totalWaves,
    isAmbush: mission.isAmbush,
    betweenWaves: mission.betweenWaves,
  });

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

  const handleStartWave = () => {
    SoundManager.play('wave');
    MissionControlBridge.requestStartWave();
  };

  const lionUnlocked = (save.upgrades.lion_level ?? 0) >= 1;
  const lionModes: LionMode[] = mission.isAmbush
    ? ['follow', 'guard', 'aggressive']
    : ['follow', 'guard', 'guard_left', 'guard_right', 'aggressive'];
  const isWide = Boolean(mission.missionId && getDefenseLayout(mission.missionId).wideBattlefield);
  const canRepositionPosts =
    mission.usePrepBuildRules &&
    isWide &&
    (mission.preparing || mission.betweenWaves || mission.awaitingWaveStart);

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

      {mission.awaitingWaveStart && !mission.isPaused && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-28 flex flex-col items-center gap-2 px-4 md:bottom-8">
          <p className="max-w-md text-center text-xs text-cyan-100/90">{waveStartHint}</p>
          <button
            type="button"
            onClick={handleStartWave}
            className="rounded-xl border-2 border-desert-gold bg-desert-gold/90 px-8 py-3 font-display text-lg font-bold text-desert-night shadow-lg shadow-black/40 transition hover:bg-desert-gold hover:scale-[1.02] active:scale-95"
          >
            {waveStartLabel}
          </button>
          <p className="text-[10px] text-white/40">Press Y to sound the horn</p>
        </div>
      )}

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
          {mission.preparing && !mission.awaitingWaveStart && (
            <p className="text-xs text-cyan-300">Prepare — build & repair!</p>
          )}
          {mission.awaitingWaveStart && (
            <p className="text-xs text-amber-300">Awaiting your signal…</p>
          )}
          {!mission.isAmbush && (
            <p className="text-[10px] text-white/50">
              Build: <span className="text-desert-gold">{buildName}</span>
              {mission.usePrepBuildRules && (
                <span className="text-white/40">
                  {' '}
                  · towers {mission.towersBuilt}/{mission.maxTowerBuilds} · traps {mission.trapsBuilt}/
                  {mission.maxTrapBuilds}
                </span>
              )}
            </p>
          )}
          {mission.heroId && (
            <p className="text-[10px] text-cyan-300">
              Hero: {getHero(mission.heroId)?.name ?? mission.heroId}
              {isWide ? ` · ${BATTLE_POST_LABELS[mission.heroPost]}` : ''}
              {!isWide && mission.gateGuardActive ? ' · Gate Guard' : ''}
            </p>
          )}
          {isWide && mission.defenderPost !== 'none' && (
            <p className="text-[10px] text-blue-200/80">
              {getDefender(mission.defenderId)?.name ?? 'Defender'} · {DEFENDER_POST_LABELS[mission.defenderPost]}
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
        <div className="hidden rounded-lg bg-black/50 px-4 py-2 text-center backdrop-blur md:block pointer-events-auto">
          <p>
            Gold <span className="font-bold text-desert-gold">{mission.goldCollected}</span>
          </p>
          {mission.usePrepBuildRules && (
            <p className="text-[10px] text-white/50">
              Wood {mission.missionWood} · Iron {mission.missionIron}
            </p>
          )}
          {lionUnlocked && !mission.isAmbush && (
            <div className="mt-2 flex flex-wrap gap-1">
              {lionModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setLionMode(mode);
                    SoundManager.play('click');
                  }}
                  className={`rounded border px-1.5 py-0.5 text-[9px] ${
                    save.lionMode === mode
                      ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                      : 'border-white/15 text-white/50'
                  }`}
                >
                  {LION_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
          )}
          {canRepositionPosts && mission.heroId && (
            <div className="pointer-events-auto mt-2">
              <p className="text-[9px] text-white/40">Hero post</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(['gate', 'left', 'right'] as BattlePost[]).map((post) => (
                  <button
                    key={post}
                    type="button"
                    onClick={() => {
                      setMissionPosts({ heroPost: post });
                      SoundManager.play('click');
                    }}
                    className={`rounded border px-1.5 py-0.5 text-[9px] ${
                      mission.heroPost === post
                        ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-100'
                        : 'border-white/15 text-white/50'
                    }`}
                  >
                    {BATTLE_POST_LABELS[post]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {canRepositionPosts && (
            <div className="pointer-events-auto mt-2">
              <p className="text-[9px] text-white/40">Defender</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(['none', 'gate', 'left', 'right'] as DefenderPost[]).map((post) => (
                  <button
                    key={post}
                    type="button"
                    onClick={() => {
                      setMissionPosts({ defenderPost: post });
                      SoundManager.play('click');
                    }}
                    className={`rounded border px-1.5 py-0.5 text-[9px] ${
                      mission.defenderPost === post
                        ? 'border-blue-400/60 bg-blue-500/20 text-blue-100'
                        : 'border-white/15 text-white/50'
                    }`}
                  >
                    {DEFENDER_POST_LABELS[post]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-1 text-[10px] text-white/40">{controlHints}</p>
          {mission.heroId && (
            <SkillBar label="Hero (Q)" pct={mission.heroAbilityCooldown} color="bg-teal-400" />
          )}
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
