import { formatKeyLabel, type KeyBindings } from '@malik/shared';

export interface MissionHintOptions {
  sandSlashUnlocked: boolean;
  bowUnlocked: boolean;
  spearUnlocked: boolean;
  warCryUnlocked: boolean;
  sentinelUnlocked: boolean;
  isAmbush: boolean;
}

export function buildMissionControlHints(bindings: KeyBindings, opts: MissionHintOptions): string {
  const parts: string[] = [
    `${formatKeyLabel(bindings.dodge)} dodge`,
    `${formatKeyLabel(bindings.shield_bash)} bash`,
  ];

  if (opts.sandSlashUnlocked) parts.push(`${formatKeyLabel(bindings.sand_slash)} slash`);
  if (opts.bowUnlocked) parts.push(`${formatKeyLabel(bindings.bow)} bow`);
  if (opts.spearUnlocked) parts.push(`${formatKeyLabel(bindings.spear)} spear`);
  if (opts.warCryUnlocked) parts.push(`${formatKeyLabel(bindings.war_cry)} cry`);
  if (opts.sentinelUnlocked) parts.push(`${formatKeyLabel(bindings.sentinel)} shield`);

  if (!opts.isAmbush) {
    parts.push(`${formatKeyLabel(bindings.repair)} repair`);
    parts.push(`${formatKeyLabel(bindings.build)} build`);
    parts.push(`${formatKeyLabel(bindings.cycle_build)} cycle`);
  }

  return parts.join(' · ');
}
