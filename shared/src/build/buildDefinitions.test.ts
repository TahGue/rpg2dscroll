import { describe, expect, it } from 'vitest';
import { BARRICADE, BUILD_OPTIONS, getBuildDefinition } from './buildDefinitions';

describe('buildDefinitions', () => {
  it('includes barricade with wood cost and HP', () => {
    expect(BARRICADE.woodCost).toBe(3);
    expect(BARRICADE.maxHp).toBe(140);
    expect(BUILD_OPTIONS.map((b) => b.id)).toContain('barricade');
  });

  it('includes expanded towers, traps, walls, and support builds', () => {
    expect(BUILD_OPTIONS).toHaveLength(20);
    expect(BUILD_OPTIONS.map((b) => b.id)).toEqual([
      'arrow_tower',
      'fire_tower',
      'water_tower',
      'relic_tower',
      'ballista',
      'spike_trap',
      'fire_pot',
      'water_slow_trap',
      'poison_trap',
      'sand_pit',
      'light_trap',
      'rolling_stone',
      'barricade',
      'reinforced_wall',
      'stone_wall',
      'spiked_wall',
      'relic_wall',
      'repair_station',
      'iron_tower',
      'lion_den',
    ]);
  });

  it('marks build roles for slot limits', () => {
    expect(getBuildDefinition('fire_tower')?.role).toBe('tower');
    expect(getBuildDefinition('poison_trap')?.role).toBe('trap');
    expect(getBuildDefinition('stone_wall')?.role).toBe('wall');
  });

  it('resolves build by id', () => {
    expect(getBuildDefinition('barricade')?.name).toBe('Barricade');
  });
});
