import { useGameStore } from '@/store/gameStore';
import {
  DEFENSE_SKILLS,
  getDefenseSkillCost,
  getDefenseSkillLevel,
} from '@malik/shared';
import { SoundManager } from '@/game/systems/SoundManager';

export function DefenseSkillsScreen() {
  const save = useGameStore((s) => s.save);
  const setScreen = useGameStore((s) => s.setScreen);
  const mapHomeScreen = useGameStore((s) => s.mapHomeScreen);
  const upgradeDefenseSkill = useGameStore((s) => s.upgradeDefenseSkill);

  return (
    <div className="flex h-full flex-col bg-desert-night text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <button
          type="button"
          onClick={() => {
            SoundManager.play('click');
            setScreen(mapHomeScreen);
          }}
          className="text-white/60 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="font-display text-2xl text-desert-gold">Defense Skills</h2>
        <span className="text-desert-gold">{save.gold}g</span>
      </header>

      <p className="border-b border-white/5 px-8 py-3 text-sm text-white/60">
        Permanent upgrades for prep missions — build cheaper, repair faster, start with more supplies.
      </p>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-8 md:grid-cols-2 lg:grid-cols-3">
        {DEFENSE_SKILLS.map((skill) => {
          const level = getDefenseSkillLevel(save, skill.id);
          const maxed = level >= skill.maxLevel;
          const cost = getDefenseSkillCost(skill, level);
          return (
            <div key={skill.id} className="rounded-xl border border-teal-500/30 bg-black/30 p-5">
              <h3 className="font-semibold text-teal-200">{skill.name}</h3>
              <p className="mt-1 text-sm text-white/60">{skill.description}</p>
              <p className="mt-2 text-xs text-white/40">{skill.effectLabel}</p>
              <p className="mt-3 text-sm">
                Level <span className="font-bold text-white">{level}</span> / {skill.maxLevel}
              </p>
              <button
                type="button"
                disabled={maxed || save.gold < cost}
                onClick={() => {
                  if (upgradeDefenseSkill(skill.id)) SoundManager.play('click');
                }}
                className="mt-4 w-full rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {maxed ? 'Max Level' : `Upgrade (${cost}g)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
