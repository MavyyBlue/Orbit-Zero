// Original procedural soundtrack and cues; no downloaded media or SDKs.
export class Sound {
  constructor(settings) { this.settings = settings; this.ctx = null; this.beat = 0; this.timer = null; }
  unlock() {
    try { this.ctx ||= new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume(); } catch { return; }
    if (!this.timer) this.timer = setInterval(() => {
      if (!this.settings.music || document.hidden || this.ctx.state !== 'running') return;
      this.tone([130.81, 164.81, 196, 246.94, 196, 164.81, 146.83, 196][this.beat++ % 8], .85, .018, 'sine');
    }, 650);
  }
  tone(f, duration, volume = .07, type = 'sine') {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = this.ctx.currentTime;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + duration);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + duration);
  }
  cue(kind) {
    if (this.settings.sound) {
      const notes = { launch: [220, 330], pickup: [660, 880], near: [440, 660, 990], orbit: [262, 392, 523], release: [523, 784], gate: [330, 440, 660, 880], crash: [85, 48], lost: [147, 98] }[kind] || [330];
      notes.forEach((f, i) => setTimeout(() => this.tone(f, .22, .045, kind === 'crash' ? 'triangle' : 'sine'), i * 55));
    }
    if (this.settings.haptics && ['near', 'gate', 'crash'].includes(kind)) {
      if (window.OrbitPlatform?.haptic) window.OrbitPlatform.haptic(kind === 'crash' ? 45 : 18);
      else navigator.vibrate?.(kind === 'crash' ? 45 : 18);
    }
  }
  suspend() { this.ctx?.suspend(); }
}
