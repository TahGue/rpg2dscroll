import { describe, expect, it } from 'vitest';
import { BARRICADE, BUILD_OPTIONS, getBuildDefinition } from './buildDefinitions';

describe('buildDefinitions', () => {
  it('includes barricade with wood cost and HP', () => {
    expect(BARRICADE.woodCost).toBe(3);
    expect(BARRICADE.maxHp).toBe(140);
    expect(BUILD_OPTIONS.map((b) => b.id)).toContain('barricade');
  });

  it('includes all six build types', () => {
    expect(BUILD_OPTIONS).toHaveLength(6);
    expect(BUILD_OPTIONS.map((b) => b.id)).toEqual([
      'arrow_tower',
      'spike_trap',
      'barricade',
      'repair_station',
      'iron_tower',
      'lion_den',
    ]);
  });

  it('resolves build by id', () => {
    expect(getBuildDefinition('barricade')?.name).toBe('Barricade');
  });
});
