declare global {
  interface Window {
    __KOUDOU_BGM_PLAYER__?: LoopingMusicPlayer;
    __KOUDOU_AUDIO_CTX__?: AudioContext;
    __KOUDOU_MASTER_GAIN__?: GainNode;
    webkitAudioContext?: typeof AudioContext;
  }
}

const DEFAULT_CROSSFADE_SECONDS = 3;
const SCHEDULE_AHEAD_SECONDS = 4;
const SCHEDULER_INTERVAL_MS = 1000;

/** Volume nhạc nền mặc định — hạ bớt để không lấn át audio thoại/bài tập nghe. */
export const DEFAULT_BGM_VOLUME = 0.5;

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

  // Track volume, mute, duck, and pause state
  private targetVolume = DEFAULT_BGM_VOLUME;
  private isMuted = false;
  private isPaused = false;
  private isDucked = false;
  private duckVolume = 0;

  private ensureContext(): AudioContext {
    if (typeof window !== "undefined") {
      if (window.__KOUDOU_AUDIO_CTX__ && window.__KOUDOU_AUDIO_CTX__.state !== "closed") {
        this.ctx = window.__KOUDOU_AUDIO_CTX__;
        this.masterGain = window.__KOUDOU_MASTER_GAIN__ || this.masterGain;
      }
    }

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.getEffectiveVolume();
      this.masterGain.connect(this.ctx.destination);

      if (typeof window !== "undefined") {
        window.__KOUDOU_AUDIO_CTX__ = this.ctx;
        window.__KOUDOU_MASTER_GAIN__ = this.masterGain;
      }
    }
    return this.ctx;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const ctx = this.ensureContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  getEffectiveVolume(): number {
    if (this.isMuted || this.isPaused) return 0;
    if (this.isDucked) return this.duckVolume;
    return this.targetVolume;
  }

  private applyVolume(target: number, rampSeconds = 0) {
    if (!this.masterGain || !this.ctx) return;
    const ctx = this.ctx;
    const gain = this.masterGain.gain;
    const clamped = Math.max(0, Math.min(1, target));

    try {
      gain.cancelScheduledValues(0);
      const now = ctx.currentTime;
      if (rampSeconds > 0 && clamped > 0) {
        gain.setTargetAtTime(clamped, now, rampSeconds / 3);
      } else {
        gain.setValueAtTime(clamped, now);
        gain.value = clamped;
      }
    } catch {
      gain.value = clamped;
    }
  }

  async play(url: string, crossfadeSeconds = DEFAULT_CROSSFADE_SECONDS) {
    if (this.currentUrl === url && this.schedulerHandle) return;

    const ctx = this.ensureContext();

    this.crossfadeSeconds = crossfadeSeconds;
    this.currentUrl = url;
    this.buffer = await this.loadBuffer(url);

    // Apply the effective volume at time of starting (respects ducking/muting/pausing)
    const effectiveVolume = this.getEffectiveVolume();
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(0);
      this.masterGain.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
      this.masterGain.gain.value = effectiveVolume;
    }

    if (effectiveVolume === 0 || this.isPaused || this.isDucked) {
      ctx.suspend().catch(() => {});
    } else {
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }
    }

    this.stopScheduler();
    this.nextStartTime = ctx.currentTime + 0.1;
    this.scheduleIfNeeded();
    this.schedulerHandle = setInterval(() => this.scheduleIfNeeded(), SCHEDULER_INTERVAL_MS);
  }

  stop(fadeOutSeconds = 1) {
    if (!this.ctx || !this.masterGain) return;
    this.applyVolume(0, fadeOutSeconds);
    this.stopScheduler();
    this.currentUrl = null;
  }

  setVolume(volume: number, rampSeconds = 0) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.targetVolume = clamped;
    this.applyVolume(this.getEffectiveVolume(), rampSeconds);
  }

  /**
   * Tắt tiếng hoặc hạ âm lượng nhạc nền xuống 0 (đảm bảo dừng hoàn toàn).
   */
  duck(volume = 0, rampSeconds = 0.2) {
    this.isDucked = true;
    this.duckVolume = Math.max(0, Math.min(1, volume));
    this.applyVolume(this.duckVolume, rampSeconds);

    if (this.duckVolume === 0) {
      if (this.masterGain) {
        this.masterGain.gain.value = 0;
      }
      if (this.ctx && this.ctx.state === "running") {
        this.ctx.suspend().catch(() => {});
      }
    }
  }

  /**
   * Khôi phục âm lượng nhạc nền khi bài tập kết thúc.
   */
  unduck(rampSeconds = 0.4) {
    this.isDucked = false;
    if (this.ctx && this.ctx.state === "suspended" && !this.isPaused && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
    this.applyVolume(this.getEffectiveVolume(), rampSeconds);
  }

  async pause() {
    this.isPaused = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    if (this.ctx && this.ctx.state === "running") {
      await this.ctx.suspend().catch(() => {});
    }
  }

  async resume(rampSeconds = 0.4) {
    this.isPaused = false;
    if (!this.isDucked && !this.isMuted) {
      if (this.ctx && this.ctx.state === "suspended") {
        await this.ctx.resume().catch(() => {});
      }
      this.applyVolume(this.targetVolume, rampSeconds);
    }
  }

  mute(rampSeconds = 0.2) {
    this.isMuted = true;
    this.applyVolume(0, rampSeconds);
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    }
  }

  unmute(rampSeconds = 0.2) {
    this.isMuted = false;
    if (!this.isDucked && !this.isPaused) {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      this.applyVolume(this.getEffectiveVolume(), rampSeconds);
    }
  }

  private scheduleIfNeeded() {
    if (!this.ctx || !this.buffer || this.isPaused || this.isDucked) return;
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

// Ensure single global instance across Next.js layout and page chunks
const getGlobalPlayer = (): LoopingMusicPlayer => {
  if (typeof window === "undefined") return new LoopingMusicPlayer();
  if (!window.__KOUDOU_BGM_PLAYER__) {
    window.__KOUDOU_BGM_PLAYER__ = new LoopingMusicPlayer();
  }
  return window.__KOUDOU_BGM_PLAYER__;
};

export const backgroundMusicPlayer: LoopingMusicPlayer =
  typeof window === "undefined"
    ? new LoopingMusicPlayer()
    : new Proxy({} as LoopingMusicPlayer, {
        get(_target, prop: string) {
          const player = getGlobalPlayer();
          const member = (player as unknown as Record<string, unknown>)[prop];
          if (typeof member === "function") {
            return (member as (...args: unknown[]) => unknown).bind(player);
          }
          return member;
        },
      });
