import { describe, expect, it } from 'vitest';
import { getDefenseLayout } from './missionLayouts';
import { getBuildSocketRatios } from './wideBattlefield';

describe('getDefenseLayout', () => {
  it('returns default layout for unknown missions', () => {
    const layout = getDefenseLayout('mission-unknown');
    expect(layout.worldWidth).toBe(2400);
    expect(layout.hazards).toEqual([]);
    expect(layout.relicPulseOnFinalWave).toBe(false);
  });

  it('applies oasis heal zone for Silent Oasis', () => {
    const layout = getDefenseLayout('mission-silent-oasis');
    expect(layout.hazards.some((h) => h.type === 'oasis_heal')).toBe(true);
  });

  it('applies soft sand for Red Dune Pass', () => {
    const layout = getDefenseLayout('mission-red-dune-pass');
    expect(layout.hazards.some((h) => h.type === 'soft_sand')).toBe(true);
  });

  it('enables relic pulse for Broken Watchtower', () => {
    const layout = getDefenseLayout('mission-broken-watchtower');
    expect(layout.relicPulseOnFinalWave).toBe(true);
  });

  it('configures Scorpion Nest poison hazards', () => {
    const layout = getDefenseLayout('mission-scorpion-nest');
    expect(layout.gateLabel).toBe('CAMP BARRICADE');
    expect(layout.poisonPoolsBetweenWaves?.[1]).toBeDefined();
  });

  it('adds dual build sockets and eclipse darkness for late missions', () => {
    expect(getDefenseLayout('mission-red-dune-pass').extraSocketXRatios?.length).toBe(1);
    expect(getDefenseLayout('mission-black-eclipse').eclipseDarkness).toBe(true);
    expect(getDefenseLayout('mission-shadow-emir').eclipseDarkness).toBe(true);
    const redDune = getDefenseLayout('mission-red-dune-pass');
    expect(redDune.hazards.some((h) => h.type === 'wind_gust')).toBe(true);
  });

  it('configures shrine sanctum dual sockets and prep phase', () => {
    const shrine = getDefenseLayout('mission-shrine-sanctum');
    expect(shrine.extraSocketXRatios?.length).toBe(1);
    expect(shrine.prepPhaseMs).toBe(7000);
    expect(shrine.gateLabel).toBe('SACRED SHRINE');
  });

  it('adds caravan escort build socket and prep phase', () => {
    const caravan = getDefenseLayout('mission-caravan-escort');
    expect(caravan.socketXRatio).toBe(0.45);
    expect(caravan.prepPhaseMs).toBe(6000);
  });

  it('adds bandit road prep phase', () => {
    expect(getDefenseLayout('mission-bandit-road').prepPhaseMs).toBe(1500);
  });

  it('centers gate and enables wide battlefield for Night Attack', () => {
    const layout = getDefenseLayout('mission-night-attack');
    expect(layout.worldWidth).toBeGreaterThanOrEqual(4000);
    expect(layout.gateXRatio).toBe(0.5);
    expect(layout.wideBattlefield?.leftSocketRatios.length).toBeGreaterThan(0);
    expect(layout.wideBattlefield?.rightSocketRatios.length).toBeGreaterThan(0);
    const sockets = getBuildSocketRatios(layout.wideBattlefield, layout);
    expect(sockets.length).toBeGreaterThanOrEqual(6);
  });

  it('wide Silent Oasis and Scorpion Nest use centered gates', () => {
    expect(getDefenseLayout('mission-silent-oasis').gateXRatio).toBe(0.5);
    expect(getDefenseLayout('mission-scorpion-nest').wideBattlefield).toBeDefined();
  });
});
