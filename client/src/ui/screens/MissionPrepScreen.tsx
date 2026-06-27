import { useGameStore } from '@/store/gameStore';
import {
  BLUEPRINT_LABELS,
  BATTLE_POST_LABELS,
  DEFENDER_POST_LABELS,
  DEFENDER_OPTIONS,
  GATE_GUARD,
  HEROES,
  applyDefenseSkillPrepBonus,
  getDefenseLayout,
  getHero,
  getMissionById,
  getMissionPrepConfig,
  getRecruitedHeroes,
  isHeroRecruited,
  type BattlePost,
  type DefenderPost,
  type DefenderChoice,
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
  const prepBase = getMissionPrepConfig(missionId);
  const prepConfig = prepBase ? applyDefenseSkillPrepBonus(prepBase, save) : null;
  const recruitedHeroes = getRecruitedHeroes(save.recruitedHeroes);
  const selectedHeroId =
    save.selectedHeroId && isHeroRecruited(save.recruitedHeroes, save.selectedHeroId)
      ? save.selectedHeroId
      : null;
  const gateGuard = save.prepUseGateGuard;
  const heroPost = save.prepHeroPost;
  const defenderPost = save.prepDefenderPost;
  const defenderId = save.prepDefenderId;
  const isWide = Boolean(getDefenseLayout(missionId).wideBattlefield);
  const hero = selectedHeroId ? getHero(selectedHeroId) : null;

  if (!mission || !prepConfig) {
    return null;
  }

  const handleConfirm = () => {
    SoundManager.play('click');
    const loadout: MissionLoadout = {
      heroId: selectedHeroId,
      gateGuard: isWide ? defenderPost !== 'none' : gateGuard,
      heroPost,
      defenderPost: isWide ? defenderPost : gateGuard ? 'gate' : 'none',
      defenderId,
    };
    confirmMissionPrep(missionId, loadout);
  };

  const selectHero = (heroId: string) => {
    SoundManager.play('click');
    useGameStore.getState().updateSaveFields({
      selectedHeroId: selectedHeroId === heroId ? null : heroId,
    });
  };

  const toggleGuard = () => {
    SoundManager.play('click');
    useGameStore.getState().updateSaveFields({
      prepUseGateGuard: !gateGuard,
    });
  };

  const heroRecruitHint = (heroId: string): string => {
    switch (heroId) {
      case 'aisha':
        return 'Recruit at Camp Blacksmith';
      case 'yusuf':
        return 'Recruit at Water Keeper after Night Attack';
      case 'hamza':
        return 'Recruit at Valley Camp in Scorpion Valley';
      case 'salim':
        return 'Recruit at the Sentinel Shrine after the Watchtower';
      default:
        return 'Not yet recruited';
    }
  };

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-desert-night/95 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-desert-gold/40 bg-black/70 p-6 text-white shadow-2xl sm:p-8">
        <p className="text-xs uppercase tracking-widest text-desert-gold/70">Side-scroll defense</p>
        <h1 className="font-display mt-1 text-3xl text-desert-gold">{mission.name}</h1>
        <p className="mt-2 text-sm text-white/70">{mission.storyBrief ?? mission.objective}</p>
        <p className="mt-2 text-xs text-white/45">
          Malik fights waves in a 2D defense level — separate from desert exploration and the campaign chart.
        </p>

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
                <li className="text-white/40">? Spike Trap — search the broken caravan</li>
              )}
              {!save.unlockedBlueprints.includes('iron_tower') && (
                <li className="text-white/40">? Iron Tower — mine the Iron Vein in Scorpion Valley</li>
              )}
            </ul>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-desert-gold">Hero support</h2>
          <div className="mt-3 space-y-3">
            {Object.values(HEROES).map((def) => {
              const recruited = isHeroRecruited(save.recruitedHeroes, def.id);
              return (
                <PrepToggle
                  key={def.id}
                  title={def.name}
                  subtitle={recruited ? `${def.title} — ${def.activeName}` : heroRecruitHint(def.id)}
                  detail={recruited ? def.passiveDescription : 'Not yet recruited'}
                  active={selectedHeroId === def.id}
                  disabled={!recruited}
                  onClick={() => selectHero(def.id)}
                />
              );
            })}
            {recruitedHeroes.length === 0 && (
              <p className="text-xs text-amber-200/90">Recruit at least one hero in the overworld before battle.</p>
            )}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-desert-gold">
            {isWide ? 'Defense lane assignments' : 'NPC defender'}
          </h2>
          {isWide ? (
            <div className="mt-3 space-y-4">
              <PostPicker
                label="Hero position"
                options={(['gate', 'left', 'right'] as BattlePost[]).map((post) => ({
                  id: post,
                  label: BATTLE_POST_LABELS[post],
                }))}
                value={heroPost}
                disabled={!selectedHeroId}
                onSelect={(post) => {
                  SoundManager.play('click');
                  useGameStore.getState().updateSaveFields({ prepHeroPost: post as BattlePost });
                }}
              />
              <PostPicker
                label="Defender type"
                options={DEFENDER_OPTIONS.map((def) => ({ id: def.id, label: def.name }))}
                value={defenderId}
                disabled={defenderPost === 'none'}
                onSelect={(id) => {
                  SoundManager.play('click');
                  useGameStore.getState().updateSaveFields({ prepDefenderId: id as DefenderChoice });
                }}
              />
              <PostPicker
                label="Defender assignment"
                options={(['none', 'gate', 'left', 'right'] as DefenderPost[]).map((post) => ({
                  id: post,
                  label: DEFENDER_POST_LABELS[post],
                }))}
                value={defenderPost}
                onSelect={(post) => {
                  SoundManager.play('click');
                  useGameStore.getState().updateSaveFields({
                    prepDefenderPost: post as DefenderPost,
                    prepUseGateGuard: post !== 'none',
                  });
                }}
              />
              {!selectedHeroId && (
                <p className="text-xs text-white/40">Assign a hero to choose their battlefield post.</p>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <PrepToggle
                title={GATE_GUARD.name}
                subtitle="Hold the gate line"
                detail={GATE_GUARD.description}
                active={gateGuard}
                onClick={toggleGuard}
              />
            </div>
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
            Enter defense mission
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
          Unlimited prep time — ring the war bell when ready (Y key).
        </p>
      </div>
    </div>
  );
}

function PostPicker({
  label,
  options,
  value,
  disabled,
  onSelect,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={`rounded border px-2 py-1 text-[10px] ${
              disabled
                ? 'cursor-not-allowed border-white/5 text-white/30'
                : value === option.id
                  ? 'border-desert-gold/60 bg-desert-gold/15 text-desert-gold'
                  : 'border-white/15 text-white/60 hover:border-white/30'
            }`}
          >
            {option.label}
          </button>
        ))}
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
