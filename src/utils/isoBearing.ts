/**
 * Convertit un écart de coordonnées monde (dx, dz) en angle écran (degrés,
 * 0° = vers le haut, sens horaire) pour une aiguille/flèche 2D.
 *
 * Même formule que l'aiguille de `CompassHUD` : la caméra isométrique tourne
 * les axes X/Z de Math.PI/4 par rapport à l'écran (voir Player.tsx), donc un
 * simple `atan2(dz, dx)` pointerait dans la mauvaise direction.
 */
export function isoBearingDeg(dx: number, dz: number): number {
  return (Math.atan2(dx - dz, -(dx + dz)) * 180) / Math.PI;
}
