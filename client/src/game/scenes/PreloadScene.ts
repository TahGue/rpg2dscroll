import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    this.createLoadingBar();
    this.createAllTextures();
    this.time.delayedCall(400, () => this.scene.start('MissionScene'));
  }

  private createLoadingBar(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const barW = 300;

    this.add.text(w / 2, h / 2 - 30, 'Loading...', {
      fontSize: '18px',
      color: '#d4a843',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    const bg = this.add.rectangle(w / 2, h / 2 + 10, barW, 12, 0x333333);
    const fill = this.add.rectangle(w / 2 - barW / 2, h / 2 + 10, 0, 10, 0xd4a843).setOrigin(0, 0.5);

    this.tweens.add({
      targets: fill,
      width: barW,
      duration: 350,
      ease: 'Sine.easeInOut',
    });

    bg.setScrollFactor(0);
    fill.setScrollFactor(0);
  }

  private createAllTextures(): void {
    this.createMalikTexture('malik', false);
    this.createMalikTexture('malik_attack', true);
    this.createMalikBlockTexture();
    this.createHyenaTexture();
    this.createBanditTexture('sand_bandit', 0xa0522d, 0x654321);
    this.createBanditTexture('bandit_leader', 0x8b0000, 0x4a0000, 40, 50);
    this.createArcherTexture();
    this.createScorpionTexture();
    this.createScorpionSkitterTexture();
    this.createSpittingScorpionTexture();
    this.createIronVanguardTexture();
    this.createSandWraithTexture();
    this.createBanditTexture('bandit_warlord', 0x660000, 0x330000, 44, 52);
    this.createBanditTexture('camel_raider', 0xc4a35a, 0x8b6914, 40, 36);
    this.createSandWispTexture();
    this.createShadowEmirTexture();
    this.createSpikeTrapTexture();
    this.createBarricadeTexture();
    this.createGateTexture('gate', 0x696969);
    this.createGateTexture('gate_oasis', 0x4a8090);
    this.createShrineTexture();
    this.createCaravanTexture();
    this.createArrowTexture();
    this.createGroundTexture('ground', 0xc4a35a, 0xa08040);
    this.createGroundTexture('ground_day', 0xd4b86a, 0xb09850);
    this.createGroundTexture('ground_oasis', 0x8ab060, 0x6a9040);
    this.createGroundTexture('ground_ruins', 0x908070, 0x706050);
    this.createDuneTexture('dune_far', 128, 64);
    this.createDuneTexture('dune_mid', 96, 48);
    this.createPalmTexture();
    this.createBuildTextures();
    this.createLionTexture();
    this.createRectTexture('star', 4, 4, 0xffffff, 0xffffff);
    this.createRectTexture('particle_dust', 8, 8, 0xc4a35a, 0xa08040);
    this.createRectTexture('particle_slash', 16, 4, 0xffffff, 0xcccccc);
    this.createRectTexture('gold_coin', 12, 12, 0xd4a843, 0xa08020);
  }

  private createMalikTexture(key: string, attacking: boolean): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = attacking ? 40 : 32;
    const h = 48;

    g.fillStyle(0xc4783a, 1);
    g.fillRoundedRect(8, 16, 16, 28, 3);
    g.fillStyle(0x8b4513, 1);
    g.fillCircle(16, 12, 8);
    g.fillStyle(0xf5deb3, 1);
    g.fillCircle(16, 13, 5);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(10, 8, 22, 8, 16, 2);

    if (attacking) {
      g.fillStyle(0xcccccc, 1);
      g.fillRect(24, 10, 14, 3);
      g.fillRect(36, 6, 3, 11);
    } else {
      g.fillStyle(0xcccccc, 1);
      g.fillRect(22, 18, 3, 20);
    }

    g.fillStyle(0x5c3317, 1);
    g.fillRect(10, 42, 5, 6);
    g.fillRect(18, 42, 5, 6);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createHyenaTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8b7355, 1);
    g.fillEllipse(18, 18, 30, 18);
    g.fillStyle(0x5c4033, 1);
    g.fillTriangle(28, 10, 34, 4, 32, 14);
    g.fillTriangle(6, 12, 2, 6, 8, 16);
    g.fillStyle(0xff4444, 1);
    g.fillCircle(26, 14, 2);
    g.generateTexture('hyena', 36, 28);
    g.destroy();
  }

  private createMalikBlockTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xc4783a, 1);
    g.fillRoundedRect(8, 16, 16, 28, 3);
    g.fillStyle(0x8b4513, 1);
    g.fillCircle(16, 12, 8);
    g.fillStyle(0x888888, 1);
    g.fillRoundedRect(4, 18, 8, 22, 2);
    g.fillStyle(0xaaaaaa, 0.8);
    g.fillRect(2, 20, 4, 18);
    g.generateTexture('malik_block', 32, 48);
    g.destroy();
  }

  private createArcherTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6b8e23, 1);
    g.fillRoundedRect(6, 14, 20, 26, 3);
    g.fillStyle(0x556b2f, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x8b4513, 1);
    g.fillRect(2, 12, 28, 3);
    g.lineStyle(1, 0xcccccc);
    g.lineBetween(28, 12, 28, 24);
    g.generateTexture('bandit_archer', 32, 44);
    g.destroy();
  }

  private createLionTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xc4a35a, 1);
    g.fillEllipse(20, 18, 34, 20);
    g.fillStyle(0xa08040, 1);
    g.fillCircle(32, 12, 8);
    g.fillStyle(0x8b4513, 1);
    g.fillCircle(34, 10, 3);
    g.fillStyle(0x5c3317, 1);
    g.fillRect(8, 24, 6, 10);
    g.fillRect(26, 24, 6, 10);
    g.lineStyle(2, 0x8b4513);
    g.lineBetween(36, 14, 42, 8);
    g.generateTexture('lion', 44, 32);
    g.destroy();
  }

  private createScorpionTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4a3728, 1);
    g.fillEllipse(24, 20, 44, 28);
    g.fillStyle(0x8b4513, 1);
    g.fillCircle(38, 14, 10);
    g.fillStyle(0xff4444, 1);
    g.fillCircle(42, 12, 3);
    g.lineStyle(3, 0x4a3728);
    g.lineBetween(8, 22, 0, 30);
    g.lineBetween(8, 18, 0, 10);
    g.lineBetween(40, 22, 48, 32);
    g.lineBetween(40, 18, 48, 8);
    g.generateTexture('dune_scorpion', 52, 40);
    g.destroy();
  }

  private createScorpionSkitterTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x3a2818, 1);
    g.fillEllipse(14, 12, 24, 14);
    g.fillStyle(0xff4444, 1);
    g.fillCircle(20, 10, 2);
    g.lineStyle(2, 0x3a2818);
    g.lineBetween(4, 12, 0, 16);
    g.lineBetween(4, 10, 0, 6);
    g.lineBetween(22, 12, 26, 18);
    g.lineBetween(22, 10, 26, 4);
    g.generateTexture('scorpion_skitter', 28, 22);
    g.destroy();
  }

  private createSpittingScorpionTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4a3828, 1);
    g.fillEllipse(18, 16, 32, 18);
    g.fillStyle(0x66ff66, 0.8);
    g.fillCircle(28, 12, 4);
    g.fillStyle(0xff4444, 1);
    g.fillCircle(30, 11, 2);
    g.lineStyle(2, 0x4a3828);
    g.lineBetween(6, 16, 0, 22);
    g.lineBetween(6, 14, 0, 8);
    g.generateTexture('spitting_scorpion', 36, 30);
    g.destroy();
  }

  private createIronVanguardTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x555555, 1);
    g.fillRoundedRect(6, 12, 28, 32, 4);
    g.fillStyle(0x888888, 1);
    g.fillRect(4, 16, 8, 24);
    g.fillCircle(20, 10, 8);
    g.fillStyle(0x333333, 1);
    g.fillRect(14, 6, 12, 6);
    g.generateTexture('iron_vanguard', 36, 48);
    g.destroy();
  }

  private createSandWraithTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xc8b8a0, 0.85);
    g.fillEllipse(16, 20, 22, 28);
    g.fillStyle(0x9a88cc, 0.7);
    g.fillTriangle(16, 4, 8, 14, 24, 14);
    g.fillStyle(0x6644aa, 1);
    g.fillCircle(12, 16, 2);
    g.fillCircle(20, 16, 2);
    g.fillStyle(0xe8e0d0, 0.5);
    g.fillEllipse(16, 34, 18, 8);
    g.generateTexture('sand_wraith', 32, 40);
    g.destroy();
  }

  private createSandWispTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffeeaa, 0.7);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0xffcc44, 0.5);
    g.fillCircle(20, 12, 6);
    g.fillCircle(10, 18, 5);
    g.generateTexture('sand_wisp', 32, 32);
    g.destroy();
  }

  private createShadowEmirTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x120820, 1);
    g.fillRoundedRect(6, 14, 44, 48, 6);
    g.fillStyle(0x2a1040, 1);
    g.fillTriangle(28, 2, 14, 18, 42, 18);
    g.fillStyle(0x550088, 0.6);
    g.fillEllipse(28, 36, 38, 20);
    g.fillStyle(0xff2244, 1);
    g.fillCircle(20, 28, 4);
    g.fillCircle(34, 28, 4);
    g.fillStyle(0xffaa44, 0.8);
    g.fillCircle(20, 28, 1.5);
    g.fillCircle(34, 28, 1.5);
    g.lineStyle(4, 0xaa44ff, 0.9);
    g.lineBetween(42, 34, 58, 48);
    g.lineStyle(2, 0x6622aa, 0.5);
    g.lineBetween(10, 20, 4, 8);
    g.lineBetween(46, 20, 52, 8);
    g.generateTexture('shadow_emir', 60, 64);
    g.destroy();
  }

  private createSpikeTrapTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x444444, 1);
    g.fillRect(4, 24, 40, 8);
    g.fillStyle(0x888888, 1);
    for (let i = 0; i < 5; i++) {
      g.fillTriangle(8 + i * 8, 24, 12 + i * 8, 8, 16 + i * 8, 24);
    }
    g.generateTexture('spike_trap', 48, 32);
    g.destroy();
  }

  private createBarricadeTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6b4423, 1);
    g.fillRect(4, 18, 44, 22);
    g.fillStyle(0x8b6914, 1);
    for (let i = 0; i < 4; i++) {
      g.fillRect(6 + i * 11, 8, 8, 14);
    }
    g.lineStyle(2, 0x4a3010, 1);
    g.lineBetween(4, 28, 48, 28);
    g.generateTexture('barricade', 52, 40);
    g.destroy();
  }

  private createBuildTextures(): void {
    const socket = this.make.graphics({ x: 0, y: 0 });
    socket.fillStyle(0x666666, 0.5);
    socket.fillRect(4, 20, 40, 8);
    socket.lineStyle(2, 0xd4a843, 0.8);
    socket.strokeRect(4, 20, 40, 8);
    socket.lineStyle(1, 0xd4a843, 0.5);
    socket.strokeRect(10, 10, 28, 12);
    socket.generateTexture('build_socket', 48, 28);
    socket.destroy();

    const base = this.make.graphics({ x: 0, y: 0 });
    base.fillStyle(0x5c4033, 1);
    base.fillRect(8, 30, 32, 20);
    base.fillStyle(0x696969, 1);
    base.fillRect(14, 10, 20, 22);
    base.generateTexture('tower_base', 48, 50);
    base.destroy();

    const top = this.make.graphics({ x: 0, y: 0 });
    top.fillStyle(0x888888, 1);
    top.fillRect(10, 8, 16, 12);
    top.fillStyle(0x8b4513, 1);
    top.fillRect(16, 14, 20, 2);
    top.generateTexture('tower_top', 40, 24);
    top.destroy();
  }

  private createBanditTexture(key: string, fill: number, outline: number, w = 32, h = 44): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(fill, 1);
    g.fillRoundedRect(6, 14, 20, 26, 3);
    g.fillStyle(outline, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x222222, 1);
    g.fillRect(8, 8, 16, 4);
    g.fillStyle(0x888888, 1);
    g.fillRect(24, 16, 3, 18);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createGateTexture(key: string, fill: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(fill, 1);
    g.fillRect(8, 20, 48, 76);
    g.fillRect(4, 16, 56, 8);
    g.fillStyle(0x333333, 1);
    g.fillRect(20, 40, 24, 40);
    g.fillStyle(0xd4a843, 0.6);
    g.fillCircle(32, 56, 4);
    g.generateTexture(key, 64, 96);
    g.destroy();
  }

  private createShrineTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x887766, 1);
    g.fillRect(24, 30, 16, 50);
    g.fillStyle(0xd4a843, 1);
    g.fillTriangle(32, 4, 8, 32, 56, 32);
    g.fillStyle(0xaa8844, 0.6);
    g.fillCircle(32, 20, 10);
    g.generateTexture('shrine', 64, 80);
    g.destroy();
  }

  private createCaravanTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8b6914, 1);
    g.fillRoundedRect(8, 18, 56, 28, 4);
    g.fillStyle(0xd4a843, 1);
    g.fillTriangle(64, 18, 78, 32, 64, 46);
    g.fillStyle(0x654321, 1);
    g.fillCircle(20, 48, 8);
    g.fillCircle(56, 48, 8);
    g.fillStyle(0x4a3520, 1);
    g.fillCircle(20, 48, 4);
    g.fillCircle(56, 48, 4);
    g.fillStyle(0xc4783a, 1);
    g.fillRect(14, 8, 8, 12);
    g.fillRect(42, 8, 8, 12);
    g.generateTexture('caravan', 80, 56);
    g.destroy();
  }

  private createArrowTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8b6914, 1);
    g.fillRect(0, 2, 28, 4);
    g.fillStyle(0xcccccc, 1);
    g.fillTriangle(28, 4, 36, 0, 36, 8);
    g.generateTexture('arrow', 36, 8);
    g.destroy();
  }

  private createGroundTexture(key: string, fill: number, outline: number): void {
    this.createRectTexture(key, 64, 32, fill, outline);
  }

  private createDuneTexture(key: string, width: number, height: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5c4033, 0.8);
    g.fillEllipse(width / 2, height / 2 + 10, width, height);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  private createPalmTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5c3317, 1);
    g.fillRect(14, 30, 6, 40);
    g.fillStyle(0x2a8040, 1);
    g.fillEllipse(17, 20, 30, 12);
    g.fillEllipse(17, 14, 24, 10);
    g.generateTexture('palm_tree', 36, 70);
    g.destroy();
  }

  private createRectTexture(key: string, width: number, height: number, fill: number, outline: number): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(fill, 1);
    g.fillRoundedRect(2, 2, width - 4, height - 4, 4);
    g.lineStyle(2, outline, 1);
    g.strokeRoundedRect(2, 2, width - 4, height - 4, 4);
    g.generateTexture(key, width, height);
    g.destroy();
  }
}
