import { useGameStore } from '@/store/gameStore';

type MusicMode = 'menu' | 'map' | 'mission' | 'battle' | 'boss' | 'finale';

class MusicManagerImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private rhythmTimer: ReturnType<typeof setInterval> | null = null;
  private windTimer: ReturnType<typeof setTimeout> | null = null;
  private mode: MusicMode | null = null;
  private baseMode: MusicMode = 'mission';
  private battleIntensity = 0;
  private bossPhase = 0;

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private getVolume(): number {
    return useGameStore.getState().save.settings.musicVolume;
  }

  startMenu(): void {
    this.start('menu', 55, 0.08);
  }

  startMap(): void {
    this.start('map', 48, 0.05);
  }

  startMission(): void {
    this.start('mission', 72, 0.1);
  }

  startBoss(): void {
    this.bossPhase = 0;
    this.start('boss', 42, 0.12);
  }

  startFinale(): void {
    this.bossPhase = 0;
    this.start('finale', 36, 0.14);
  }

  setBossPhase(phase: number): void {
    this.bossPhase = phase;
    if (this.mode !== 'boss' && this.mode !== 'finale') return;
    const interval = phase >= 2 ? 0.75 : phase >= 1 ? 1.0 : 1.35;
    this.startRhythm(interval);
    if (this.droneOsc && this.ctx) {
      const base = this.mode === 'finale' ? 34 : 40;
      this.droneOsc.frequency.linearRampToValueAtTime(base - phase * 3, this.ctx.currentTime + 0.4);
    }
  }

  setBattle(active: boolean): void {
    this.battleIntensity = active ? 1 : 0;
    if (this.droneGain && this.ctx) {
      const vol = this.getVolume();
      const target =
        this.mode === 'battle' || active
          ? vol * (this.mode === 'finale' ? 0.16 : 0.14)
          : vol * 0.1;
      this.droneGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.5);
    }
    if (active && (this.mode === 'mission' || this.mode === 'boss' || this.mode === 'finale')) {
      this.mode = 'battle';
      this.startRhythm(this.baseMode === 'finale' || this.bossPhase >= 2 ? 0.9 : 1.2);
    } else if (!active && this.mode === 'battle') {
      this.mode = this.baseMode;
      if (this.bossPhase > 0) this.setBossPhase(this.bossPhase);
      else this.startRhythm(this.baseMode === 'boss' ? 1.5 : this.baseMode === 'finale' ? 1.35 : 2.0);
    }
  }

  stop(): void {
    this.stopRhythm();
    this.stopWind();
    if (this.droneOsc) {
      try { this.droneOsc.stop(); } catch { /* already stopped */ }
      this.droneOsc.disconnect();
      this.droneOsc = null;
    }
    this.mode = null;
    this.bossPhase = 0;
  }

  updateVolume(): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.getVolume(), this.ctx.currentTime);
    }
  }

  private start(mode: MusicMode, freq: number, gainLevel: number): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.stop();
    this.mode = mode;
    this.baseMode = mode;
    this.masterGain.gain.setValueAtTime(this.getVolume(), ctx.currentTime);

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(gainLevel * this.getVolume(), ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.droneOsc = ctx.createOscillator();
    this.droneOsc.type = mode === 'finale' ? 'sawtooth' : 'sine';
    this.droneOsc.frequency.setValueAtTime(freq, ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneOsc.start();

    const harmonic = ctx.createOscillator();
    harmonic.type = mode === 'finale' ? 'square' : 'triangle';
    harmonic.frequency.setValueAtTime(freq * (mode === 'finale' ? 1.25 : 1.5), ctx.currentTime);
    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(gainLevel * 0.3 * this.getVolume(), ctx.currentTime);
    harmonic.connect(hGain);
    hGain.connect(this.masterGain);
    harmonic.start();

    const rhythm =
      mode === 'menu' ? 2.5 : mode === 'map' ? 3.5 : mode === 'finale' ? 1.35 : mode === 'boss' ? 1.5 : 2.0;
    this.startRhythm(rhythm);
    if (mode === 'map') this.scheduleWind();
  }

  private startRhythm(intervalSec: number): void {
    this.stopRhythm();
    this.rhythmTimer = setInterval(() => this.playDrum(), intervalSec * 1000);
  }

  private stopRhythm(): void {
    if (this.rhythmTimer) {
      clearInterval(this.rhythmTimer);
      this.rhythmTimer = null;
    }
  }

  private stopWind(): void {
    if (this.windTimer) {
      clearTimeout(this.windTimer);
      this.windTimer = null;
    }
  }

  private scheduleWind(): void {
    this.stopWind();
    if (this.mode !== 'map') return;
    const delay = 8000 + Math.random() * 6000;
    this.windTimer = setTimeout(() => {
      this.playWind();
      this.scheduleWind();
    }, delay);
  }

  private playWind(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.getVolume() <= 0 || this.mode !== 'map') return;

    const now = ctx.currentTime;
    const vol = this.getVolume() * 0.035;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.6);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.6);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 2);
  }

  private playDrum(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.getVolume() <= 0) return;

    const now = ctx.currentTime;
    const vol =
      this.getVolume() *
      (this.battleIntensity
        ? this.mode === 'finale'
          ? 0.15
          : 0.12
        : this.mode === 'map'
          ? 0.04
          : 0.06);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.battleIntensity ? 80 : 60, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const MusicManager = new MusicManagerImpl();
