/**
 * Web Audio API synthesizer for phone dialing, ringback tones,
 * WhatsApp notifications, and softphone audio feedback.
 * Standardized for Indian Telecom (TRAI / BSNL / Airtel ringback cadence).
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ringInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Play WhatsApp incoming notification chime */
  playWhatsAppChime() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1 (E6 - 1318 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.5, now);
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2 (B6 - 1975 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1975.5, now + 0.12);
      gain2.gain.setValueAtTime(0.16, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }

  /**
   * Start authentic Indian Telephone Ringback Tone (TRAI / DoT standard)
   * 400 Hz modulated tone with classic Indian double ring:
   * 0.4s tone -> 0.2s silence -> 0.4s tone -> 2.0s silence
   */
  startRingback() {
    this.stopRingback();
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const playIndianBurst = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Pulse 1: 0.0s to 0.4s
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.08, now + 0.03);
        gain1.gain.setValueAtTime(0.08, now + 0.38);
        gain1.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        // Pulse 2: 0.6s to 1.0s (0.2s pause in between)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, now + 0.6);
        gain2.gain.setValueAtTime(0, now + 0.6);
        gain2.gain.linearRampToValueAtTime(0.08, now + 0.63);
        gain2.gain.setValueAtTime(0.08, now + 0.98);
        gain2.gain.linearRampToValueAtTime(0.001, now + 1.0);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.6);
        osc2.stop(now + 1.0);
      };

      playIndianBurst();
      this.ringInterval = window.setInterval(playIndianBurst, 3000);
    } catch {
      // ignored
    }
  }

  stopRingback() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  /** Play connected sound */
  playCallConnected() {
    this.stopRingback();
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignored
    }
  }

  /** Play hang up tone */
  playCallEnded() {
    this.stopRingback();
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0, 0.12, 0.24].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now + offset);
        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch {
      // ignored
    }
  }

  /** Play keypad DTMF tone */
  playDtmfTone(digit: string) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const dtmfFreqs: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };

      const freqs = dtmfFreqs[digit] || [700, 1200];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(freqs[0], now);
      osc2.frequency.setValueAtTime(freqs[1], now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch {
      // ignored
    }
  }
}

export const soundEngine = new SoundEngine();
