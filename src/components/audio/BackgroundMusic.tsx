"use client";

import { useEffect } from "react";
import { backgroundMusicPlayer } from "@/lib/loopingMusicPlayer";

const BGM_URL = "/audio/koudou_background_music.wav";

/**
 * Mounted once in the root layout. Browsers block audio autoplay until the
 * player has interacted with the page, so this waits for the first
 * click/keypress before starting the looping background music.
 */
export default function BackgroundMusic() {
  useEffect(() => {
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      backgroundMusicPlayer.play(BGM_URL).catch((error) => {
        console.error("Failed to start background music:", error);
      });
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return null;
}
