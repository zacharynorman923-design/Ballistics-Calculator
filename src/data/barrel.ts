// Muzzle velocity adjusted for the rifle's barrel length.
//
// Box velocities come from a test barrel (usually 24", 16" for 300 BLK).
// A shorter barrel loses velocity at a roughly constant rate per inch over
// the range hunters care about; the rate depends mostly on case capacity.
// These defaults are rules of thumb; a chronograph beats any of them.

import type { LoadProfile } from './presets';

export const DEFAULT_TEST_BARREL_IN = 24;

/** Typical velocity change per inch of barrel, fps. */
export function defaultFpsPerInch(cartridge: string, muzzleVelocity: number): number {
  const c = cartridge.toLowerCase();
  // Subsonic loads use fast powders that finish burning in short barrels.
  if (muzzleVelocity < 1200) return 5;
  if (/mag|prc|wsm|ultra/.test(c)) return 30;
  if (/30-30|30 30/.test(c)) return 20;
  return 25;
}

/** The rifle's barrel, remembered per cartridge (see AppState.barrels). */
export interface RifleBarrel {
  enabled: boolean;
  barrelIn: number;
}

export interface BarrelSettings {
  enabled: boolean;
  testBarrelIn: number;
  barrelIn: number;
  fpsPerInch: number;
}

/** Barrel settings for a load fired from a rifle, with defaults filled in. */
export function barrelSettings(p: LoadProfile, rifle?: RifleBarrel): BarrelSettings {
  const testBarrelIn = p.testBarrelIn ?? DEFAULT_TEST_BARREL_IN;
  return {
    enabled: rifle?.enabled ?? false,
    testBarrelIn,
    barrelIn: rifle?.barrelIn ?? testBarrelIn,
    fpsPerInch: p.fpsPerInch ?? defaultFpsPerInch(p.cartridge, p.muzzleVelocity),
  };
}

/** Velocity change from the box figure, fps (negative for a shorter barrel). */
export function barrelVelocityDelta(p: LoadProfile, rifle?: RifleBarrel): number {
  const b = barrelSettings(p, rifle);
  if (!b.enabled) return 0;
  return (b.barrelIn - b.testBarrelIn) * b.fpsPerInch;
}

/** Muzzle velocity the solver should use for this profile. */
export function effectiveVelocity(p: LoadProfile, rifle?: RifleBarrel): number {
  return Math.max(100, p.muzzleVelocity + barrelVelocityDelta(p, rifle));
}
