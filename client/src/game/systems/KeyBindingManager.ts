import Phaser from 'phaser';
import { DEFAULT_KEY_BINDINGS, type ControlAction, type KeyBindings } from '@malik/shared';
import { useGameStore } from '@/store/gameStore';

export function getKeyBindings(): KeyBindings {
  const settings = useGameStore.getState().save.settings;
  return { ...DEFAULT_KEY_BINDINGS, ...settings.keyBindings };
}

export function bindKey(scene: Phaser.Scene, action: ControlAction): Phaser.Input.Keyboard.Key {
  const keyCode = getKeyBindings()[action];
  return scene.input.keyboard!.addKey(keyCode);
}
