import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVE } from '../types/save';
import { getOverworldNpcDialogue } from './npcDialogues';
import { getOverworldRegionIntro, shouldShowOverworldRegionIntro } from './regionIntros';

describe('getOverworldNpcDialogue', () => {
  it('guides fresh players to the gate', () => {
    const dialog = getOverworldNpcDialogue('old_scout', DEFAULT_SAVE);
    expect(dialog?.lines[0]).toContain('quiet tonight');
  });

  it('updates scout after silent oasis', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-night-attack', 'mission-silent-oasis'],
    };
    const dialog = getOverworldNpcDialogue('old_scout', save);
    expect(dialog?.lines.some((line) => line.includes('Scorpion Valley'))).toBe(true);
  });

  it('blocks water keeper before night attack', () => {
    const dialog = getOverworldNpcDialogue('water_keeper', DEFAULT_SAVE);
    expect(dialog?.lines[0]).toContain('Nahran');
  });

  it('guides eclipse scout after shrine', () => {
    const save = {
      ...DEFAULT_SAVE,
      completedMissions: ['mission-shrine-sanctum'],
    };
    const dialog = getOverworldNpcDialogue('eclipse_scout', save);
    expect(dialog?.lines.some((line) => line.includes('Black Eclipse Gate'))).toBe(true);
  });
});

describe('region intros', () => {
  it('defines valley and eclipse intros', () => {
    expect(getOverworldRegionIntro('scorpion-valley')?.title).toBe('Scorpion Valley');
    expect(getOverworldRegionIntro('black-eclipse-rim')?.title).toBe('Black Eclipse Rim');
  });

  it('shows intro only on first visit', () => {
    expect(shouldShowOverworldRegionIntro('scorpion-valley', ['nahran-outskirts'])).toBe(true);
    expect(
      shouldShowOverworldRegionIntro('scorpion-valley', ['nahran-outskirts', 'scorpion-valley']),
    ).toBe(false);
  });
});
