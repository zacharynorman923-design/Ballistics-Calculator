// App state shape and its mapping onto solver input.

import { PRESETS, type LoadProfile } from '../data/presets';
import { STANDARD_ENV, type AngleUnit, type Environment, type ShotInput } from '../solver';

export type TabId = 'table' | 'zeros' | 'optimal' | 'card' | 'chart' | 'profiles' | 'glossary';

export interface AppState {
  profile: LoadProfile;
  env: Environment;
  maxRange: number;
  rangeStep: number;
  clickUnit: AngleUnit;
  tab: TabId;
  customZero: number;
  windowNear: number;
  windowFar: number;
  targetRadius: number;
  zerosMode: 'distances' | 'loads';
  /** Profile to compare against in the "switch loads" view. */
  swapProfileId: string | null;
}

export const DEFAULT_STATE: AppState = {
  profile: PRESETS[0],
  env: STANDARD_ENV,
  maxRange: 500,
  rangeStep: 25,
  clickUnit: 'MOA',
  tab: 'table',
  customZero: 225,
  windowNear: 50,
  windowFar: 250,
  targetRadius: 4,
  zerosMode: 'distances',
  swapProfileId: null,
};

export function toShot(state: AppState, zeroRange = state.profile.zeroRange): ShotInput {
  const p = state.profile;
  return {
    muzzleVelocity: p.muzzleVelocity,
    bc: p.bc,
    dragModel: p.dragModel,
    bulletWeight: p.bulletWeight,
    sightHeight: p.sightHeight,
    zeroRange,
    env: state.env,
  };
}

/** Reasons the inputs can't be solved, or null if they're usable. */
export function validate(state: AppState): string | null {
  const p = state.profile;
  if (!(p.muzzleVelocity > 100)) return 'Muzzle velocity must be over 100 fps.';
  if (!(p.bc > 0.01 && p.bc < 2)) return 'BC must be between 0.01 and 2.';
  if (!(p.bulletWeight > 0)) return 'Bullet weight must be positive.';
  if (!(p.sightHeight >= 0 && p.sightHeight < 10)) return 'Sight height must be 0–10 in.';
  if (!(p.zeroRange >= 10)) return 'Zero range must be at least 10 yd.';
  if (!(state.maxRange >= 25 && state.maxRange <= 2000)) return 'Max range must be 25–2000 yd.';
  if (!(state.rangeStep >= 1 && state.rangeStep <= state.maxRange)) return 'Range step must be 1 yd to max range.';
  if (!(state.env.pressureInHg > 10 && state.env.pressureInHg < 35)) return 'Pressure must be 10–35 inHg.';
  if (!(state.env.temperatureF > -60 && state.env.temperatureF < 140)) return 'Temperature must be −60 to 140 °F.';
  if (!(state.env.altitudeFt > -1500 && state.env.altitudeFt < 20000)) return 'Altitude must be −1,500 to 20,000 ft.';
  if (!(state.env.windSpeedMph >= 0 && state.env.windSpeedMph < 100)) return 'Wind must be 0–100 mph.';
  return null;
}
