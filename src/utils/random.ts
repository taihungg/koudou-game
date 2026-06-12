/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Returns a function that generates a random number between 0 and 1.
 */
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash function to convert 2D coordinates into a single integer seed.
 */
export function hashCoordinates(x: number, z: number, seedOffset: number = 0): number {
  let h = 37;
  h = (h * 54059) ^ (x * 76963);
  h = (h * 54059) ^ (z * 86969);
  h = (h * 54059) ^ (seedOffset * 31337);
  return h;
}
