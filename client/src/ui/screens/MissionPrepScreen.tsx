import { useGameStore } from '@/store/gameStore';
import {
  AISHA,
  BLUEPRINT_LABELS,
  GATE_GUARD,
  getHero,
  getMissionById,
  getMissionPrepConfig,
  isHeroRecruited,
  type MissionLoadout,
} from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

interface MissionPrepScreenProps {
  missionId: string;
  onBack: () => void;
}

export function MissionPrepScreen({ missionId, onBack }: MissionPrepScreenProps) {
  const save = useGameStore((s) => s.save);
  const confirmMissionPrep = useGameStore((s) => s.confirmMissionPrep);

  const mission = getMissionById(missionId);
  const prepConfig = getMissionPrepConfig(missionId);
  const aishaRecruited = isHeroRecruited(save.recruitedHeroes, 'aisha');
  const heroId = save.selectedHeroId === 'aisha' && aishaRecruited ? 'aisha' : null;
  const gateGuard = save.prepUseGateGuard;
  const hero = heroId ? getHero(heroId) : null;

  if (!mission || !prepConfig) {
    return null;
  }

  const handleConfirm = () => {
    SoundManager.play('click');
    const loadout: MissionLoadout = {
      heroId: aishaRecruited ? heroId : null,
      gateGuard,
    };
    confirmMissionPrep(missionId, loadout);
  };

  const toggleHero = () => {
    if (!aishaRecruited) return;
    SoundManager.play('click');
    useGameStore.getState().updateSaveFields({
      selectedHeroId: heroId ? null : 'aisha',
    });
  };

  const toggleGuard = () => {
    SoundManager.play('click');
    useGameStore.getState().updateSaveFields({
      prepUseGateGuard: !gateGuard,
    });
  };

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-desert-night/95 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-desert-gold/40 bg-black/70 p-6 text-white shadow-2xl sm:p-8">
        <p className="text-xs uppercase tracking-widest text-desert-gold/70">Prepare the defense</p>
        <h1 className="font-display mt-1 text-3xl text-desert-gold">{mission.name}</h1>
        <p className="mt-2 text-sm text-white/70">{mission.storyBrief ?? mission.objective}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-desert-gold">Battle supplies</h2>
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              <li>{prepConfig.startingGold} gold</li>
              <li>{prepConfig.startingWood} wood</li>
              <li>{prepConfig.startingIron} iron</li>
            </ul>
            <p className="mt-3 text-xs text-white/50">
              Build limits: {prepConfig.maxTowerBuilds} towers · {prepConfig.maxTrapBuilds} traps
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-desert-gold">Blueprints</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {save.unlockedBlueprints.map((id) => (
                <li key={id} className="text-teal-200">
                  ✓ {BLUEPRINT_LABELS[id] ?? id}
                </li>
              ))}
              {!save.unlockedBlueprints.includes('spike_trap') && (
                <li className="text-white/40">? Spike Trap — find the broken caravan</li>
              )}
            </ul>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-desert-gold">Allies</h2>
          <div className="mt-3 space-y-3">
            <PrepToggle
              title={AISHA.name}
              subtitle={
                aishaRecruited
                  ? `${AISHA.title} — ${AISHA.activeName}`
                  : 'Recruit at the Camp Blacksmith in Nahran'
              }
              detail={aishaRecruited ? AISHA.passiveDescription : 'Not yet recruited'}
              active={Boolean(heroId)}
              disabled={!aishaRecruited}
              onClick={toggleHero}
            />
            <PrepToggle
              title={GATE_GUARD.name}
              subtitle="NPC defender"
              detail={GATE_GUARD.description}
              active={gateGuard}
              onClick={toggleGuard}
            />
          </div>
          {!aishaRecruited && (
            <p className="mt-3 text-xs text-amber-200/90">
              Visit the Camp Blacksmith to recruit Aisha before the gate battle.
            </p>
          )}
        </section>

        {hero && (
          <p className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-xs text-cyan-100">
            <span className="font-semibold">{hero.name}</span> — {hero.activeDescription} Press{' '}
            <span className="text-desert-gold">Q</span> in battle.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-desert-gold px-6 py-3 font-semibold text-desert-night hover:bg-desert-gold/90"
          >
            Enter battlefield
          </button>
          <button
            type="button"
            onClick={() => {
              SoundManager.play('click');
              onBack();
            }}
            className="rounded-xl border border-white/30 px-6 py-3 text-white/70 hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          You will have unlimited time to build and repair before ringing the war bell.
        </p>
      </div>
    </div>
  );
}

function PrepToggle({
  title,
  subtitle,
  detail,
  active,
  disabled,
  onClick,
}: {
  title: string;
  subtitle: string;
  detail: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-3 text-left transition ${
        disabled
          ? 'cursor-not-allowed border-white/5 opacity-50'
          : active
            ? 'border-desert-gold/60 bg-desert-gold/10'
            : 'border-white/10 bg-black/20 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-xs text-desert-gold/80">{subtitle}</p>
        </div>
        <span className={`text-xs ${active ? 'text-teal-300' : 'text-white/40'}`}>
          {active ? 'Assigned' : 'Off'}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/50">{detail}</p>
    </button>
  );
}
