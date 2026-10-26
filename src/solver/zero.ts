// Find the bore angle that puts the bullet on the line of sight at the
// zero range.

import { pathProfile } from './path';
import type { ShotInput } from './types';
import { IN_PER_YD } from './units';

const TOLERANCE_IN = 1e-5;
const MAX_ITER = 30;

export function boreAngleForZero(input: ShotInput, dt?: number): number {
  const zero = input.zeroRange;
  if (!(zero > 0)) throw new Error('Zero range must be positive');
  // Newton iteration: raising the bore by dθ raises impact at the zero by
  // ≈ range · dθ, so the derivative is close to the range itself.
  let angle = Math.atan(input.sightHeight / (zero * IN_PER_YD));
  for (let i = 0; i < MAX_ITER; i++) {
    const pts = pathProfile(input, angle, zero, zero, { dt });
    const last = pts[pts.length - 1];
    if (last.range < zero - 1e-6) {
      throw new Error(`Bullet does not reach the ${zero} yd zero`);
    }
    const err = last.path; // inches, want 0
    if (Math.abs(err) < TOLERANCE_IN) return angle;
    angle -= err / (zero * IN_PER_YD);
  }
  return angle;
}
