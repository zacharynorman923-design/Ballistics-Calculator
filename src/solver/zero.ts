// Find the bore angle that puts the bullet at a given height relative to
// the line of sight at a given range (0 at the zero range for a zero).

import { pathProfile } from './path';
import type { ShotInput } from './types';
import { IN_PER_YD } from './units';

const TOLERANCE_IN = 1e-5;
const MAX_ITER = 30;

/** Bore angle that makes the path equal `pathIn` (+ above LOS) at `rangeYd`. */
export function boreAngleForPath(input: ShotInput, rangeYd: number, pathIn: number, dt?: number): number {
  if (!(rangeYd > 0)) throw new Error('Range must be positive');
  // Newton iteration: raising the bore by dθ raises impact at the range by
  // ≈ range · dθ, so the derivative is close to the range itself.
  let angle = Math.atan((input.sightHeight + pathIn) / (rangeYd * IN_PER_YD));
  for (let i = 0; i < MAX_ITER; i++) {
    const pts = pathProfile(input, angle, rangeYd, rangeYd, { dt });
    const last = pts[pts.length - 1];
    if (last.range < rangeYd - 1e-6) {
      throw new Error(`Bullet does not reach ${rangeYd} yd`);
    }
    const err = last.path - pathIn;
    if (Math.abs(err) < TOLERANCE_IN) return angle;
    angle -= err / (rangeYd * IN_PER_YD);
  }
  return angle;
}

export function boreAngleForZero(input: ShotInput, dt?: number): number {
  if (!(input.zeroRange > 0)) throw new Error('Zero range must be positive');
  return boreAngleForPath(input, input.zeroRange, 0, dt);
}
