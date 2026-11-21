// Muzzle velocity adjusted for the rifle's barrel length.
//
// Box velocities come from a test barrel (usually 24", 16" for 300 BLK).
// A shorter barrel loses velocity at a roughly constant rate per inch over
// the range hunters care about; the rate depends mostly on case capacity.
// These defaults are rules of thumb; a chronograph beats any of them.

import { cartridgeKey, type LoadProfile } from './presets';

/** US makers publish rifle velocities from 24" test barrels (16" for 300/8.6 BLK). */
export const DEFAULT_TEST_BARREL_IN = 24;

/**
 * Common factory barrel lengths for hunting rifles, used as the starting
 * value for "My barrel" until the user enters their own.
 */
const TYPICAL_BARREL_IN: Record<string, number> = {
  [cartridgeKey('6.5 Creedmoor')]: 22,
  [cartridgeKey('30-30 Win')]: 20,
  [cartridgeKey('30-06 Springfield')]: 22,
  [cartridgeKey('.223 Remington')]: 16,
  [cartridgeKey('7mm Rem Mag')]: 24,
  [cartridgeKey('270 Win')]: 22,
  [cartridgeKey('25-06 Rem')]: 24,
  [cartridgeKey('300 Blackout')]: 16,
  [cartridgeKey('8.6 Blackout')]: 16,
};

/** Typical rifle barrel for a cartridge, or null when unknown. */
export function typicalBarrelIn(cartridge: string): number | null {
  return TYPICAL_BARREL_IN[cartridgeKey(cartridge)] ?? null;
}

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
    barrelIn: rifle?.barrelIn ?? typicalBarrelIn(p.cartridge) ?? testBarrelIn,
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
