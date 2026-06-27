import Phaser from 'phaser';

/** Built structure that boosts repair rate when Malik stands nearby. */
export class RepairStation extends Phaser.GameObjects.Container {
  readonly repairRadius = 115;
  readonly repairMultiplier = 2.5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const base = scene.add.rectangle(0, -18, 56, 36, 0x4a6a8a, 0.85);
    const cross = scene.add.rectangle(0, -18, 8, 28, 0x88ccff, 0.9);
    const crossH = scene.add.rectangle(0, -18, 28, 8, 0x88ccff, 0.9);
    this.add([base, cross, crossH]);

    const aura = scene.add.ellipse(0, -10, 120, 40, 0x44aaff, 0.12);
    this.add(aura);

    scene.add
      .text(0, -52, 'REPAIR', {
        fontSize: '10px',
        color: '#88ccff',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5);

    scene.add.existing(this);
    this.setDepth(5);
  }

  isPlayerInRange(px: number, py: number): boolean {
    return Phaser.Math.Distance.Between(this.x, this.y - 20, px, py - 20) < this.repairRadius;
  }
}
