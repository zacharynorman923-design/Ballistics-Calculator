// Work out where a rifle is actually zeroed from where its group lands at
// a known distance, and the clicks to move to a desired zero.

import { pathProfile } from './path';
import type { ClickSettings, ShotInput } from './types';
import { correctionClicks, radiansTo } from './units';
import { boreAngleForPath, boreAngleForZero } from './zero';

export interface ImpactInput {
  /** Distance the group was shot at, yd. */
  rangeYd: number;
  /** Group center relative to the aim point, inches: + high, − low. */
  verticalIn: number;
  /** Group center relative to the aim point, inches: + right, − left. */
  horizontalIn: number;
}

export interface ZeroFromImpactResult {
  boreAngle: number;
  /** Where the bullet crosses the LOS going up, yd (null if it never rises to it). */
  nearZero: number | null;
  /** Where it crosses going down: the actual zero, yd (null if never). */
  farZero: number | null;
  /** Elevation clicks to reach `targetZero` (+ = up). */
  elevationClicks: number;
  /** Windage clicks to center the group (+ = right). */
  windageClicks: number;
  targetZero: number;
}

/** Search far enough to find a long far zero. */
const SCAN_MAX_YD = 1000;
const SCAN_STEP_YD = 1;

/**
 * `input.zeroRange` is ignored except as the default target zero; the
 * sight height and load define the rifle. Computed in still air.
 */
export function zeroFromImpact(
  input: ShotInput,
  impact: ImpactInput,
  clicks: ClickSettings,
  targetZero = input.zeroRange,
  dt?: number,
): ZeroFromImpactResult {
  const boreAngle = boreAngleForPath(input, impact.rangeYd, impact.verticalIn, dt);
  const pts = pathProfile(input, boreAngle, SCAN_MAX_YD, SCAN_STEP_YD, { dt });
  let nearZero: number | null = null;
  let farZero: number | null = null;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const at = a.range + ((0 - a.path) / (b.path - a.path)) * (b.range - a.range);
    if (nearZero === null && a.path < 0 && b.path >= 0) nearZero = at;
    if (a.path >= 0 && b.path < 0) {
      farZero = at;
      break;
    }
  }
  const target = boreAngleForZero({ ...input, zeroRange: targetZero }, dt);
  return {
    boreAngle,
    nearZero,
    farZero,
    elevationClicks: radiansTo(clicks.unit, target - boreAngle) / clicks.value,
    windageClicks: correctionClicks(impact.horizontalIn, impact.rangeYd, clicks),
    targetZero,
  };
}
