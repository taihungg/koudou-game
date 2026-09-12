const DEFAULT_CROSSFADE_SECONDS = 3;
const SCHEDULE_AHEAD_SECONDS = 4;
const SCHEDULER_INTERVAL_MS = 1000;

/**
 * Loops a track seamlessly by scheduling overlapping AudioBufferSourceNodes
 * that crossfade into each other near the loop boundary, instead of relying
 * on native `loop = true` (which only sounds seamless if the source file's
 * head/tail already match).
 */
class LoopingMusicPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private crossfadeSeconds = DEFAULT_CROSSFADE_SECONDS;
  private nextStartTime = 0;
  private schedulerHandle: ReturnType<typeof setInterval> | null = null;
  private currentUrl: string | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const ctx = this.ensureContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  async play(url: string, crossfadeSeconds = DEFAULT_CROSSFADE_SECONDS) {
    if (this.currentUrl === url && this.schedulerHandle) return;

    const ctx = this.ensureContext();
    if (ctx.state === "suspended") await ctx.resume();

    this.crossfadeSeconds = crossfadeSeconds;
    this.currentUrl = url;
    this.buffer = await this.loadBuffer(url);

    this.masterGain!.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain!.gain.setValueAtTime(1, ctx.currentTime);

    this.stopScheduler();
    this.nextStartTime = ctx.currentTime + 0.1;
    this.scheduleIfNeeded();
    this.schedulerHandle = setInterval(() => this.scheduleIfNeeded(), SCHEDULER_INTERVAL_MS);
  }

  stop(fadeOutSeconds = 1) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSeconds);
    this.stopScheduler();
    this.currentUrl = null;
  }

  setVolume(volume: number) {
    this.masterGain?.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.ctx?.currentTime ?? 0
    );
  }

  private scheduleIfNeeded() {
    if (!this.ctx || !this.buffer) return;
    while (this.nextStartTime < this.ctx.currentTime + SCHEDULE_AHEAD_SECONDS) {
      this.scheduleOne(this.nextStartTime);
    }
  }

  private scheduleOne(startTime: number) {
    const ctx = this.ctx!;
    const buffer = this.buffer!;
    const duration = buffer.duration;
    const fade = Math.min(this.crossfadeSeconds, duration / 2);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    source.connect(gain).connect(this.masterGain!);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(1, startTime + fade);
    gain.gain.setValueAtTime(1, startTime + duration - fade);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    source.start(startTime);
    source.stop(startTime + duration + 0.1);

    this.nextStartTime = startTime + duration - fade;
  }

  private stopScheduler() {
    if (this.schedulerHandle) {
      clearInterval(this.schedulerHandle);
      this.schedulerHandle = null;
    }
  }
}

export const backgroundMusicPlayer = new LoopingMusicPlayer();
