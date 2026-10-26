// Air density and speed of sound from shooter-entered conditions.
// Ballistic coefficients are referenced to the ICAO standard atmosphere
// (59 °F, 29.92 inHg, sea level), so drag is scaled by ρ / ρ₀.

import type { Environment } from './types';

/** ICAO standard sea-level air density, lb/ft³ (59 °F, 29.92 inHg, dry). */
export const STD_DENSITY = 0.0764742;
export const STD_TEMP_R = 518.67;
export const STD_PRESSURE_INHG = 29.92;

export const STANDARD_ENV: Environment = {
  temperatureF: 59,
  altitudeFt: 0,
  pressureInHg: 29.92,
  pressureIsStation: false,
  windSpeedMph: 0,
  windAngleDeg: 90,
};

export interface Atmosphere {
  /** ρ / ρ₀ — multiplies drag. */
  densityRatio: number;
  /** ft/s */
  speedOfSound: number;
  /** Station (absolute) pressure used, inHg. */
  stationPressureInHg: number;
}

/**
 * Convert a sea-level-corrected barometer reading to station pressure at
 * the given altitude using the standard-atmosphere pressure ratio.
 */
export function stationPressure(barometricInHg: number, altitudeFt: number): number {
  return barometricInHg * Math.pow(1 - 6.8756e-6 * altitudeFt, 5.25588);
}

export function atmosphere(env: Environment): Atmosphere {
  const tempR = env.temperatureF + 459.67;
  const p = env.pressureIsStation
    ? env.pressureInHg
    : stationPressure(env.pressureInHg, env.altitudeFt);
  // Ideal gas: ρ ∝ P / T.
  const densityRatio = (p / STD_PRESSURE_INHG) * (STD_TEMP_R / tempR);
  return {
    densityRatio,
    speedOfSound: 49.0223 * Math.sqrt(tempR),
    stationPressureInHg: p,
  };
}
