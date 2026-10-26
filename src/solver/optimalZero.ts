// Optimal zero for a shot window, and maximum point-blank range (MPBR).

import { pathProfile, type PathPoint } from './path';
import type { ShotInput } from './types';
import { boreAngleForZero } from './zero';

export interface OptimalZeroResult {
  /** Far zero (where the path descends through the LOS), yd. */
  zeroRange: number;
  /** Near zero (ascending crossing), yd, or null if none. */
  nearZero: number | null;
  boreAngle: number;
  /** Largest |path| anywhere in the window, inches. */
  worstDeviation: number;
  highest: { range: number; path: number };
  lowest: { range: number; path: number };
  /** True if every shot in the window stays inside the target radius. */
  fitsTarget: boolean;
}

export interface PointBlankResult {
  radius: number; // in
  /** Far zero that makes the apex exactly +radius, yd. */
  zeroRange: number;
  nearZero: number | null;
  boreAngle: number;
  apexRange: number; // yd
  /** First range the bullet is inside ±radius (0 unless sight height > radius). */
  start: number;
  /** Max point-blank range: last range before the path falls below -radius. */
  end: number;
}

interface SearchOptions {
  dt?: number;
}

const STEP_YD = 1;
const MPBR_MAX_RANGE = 1200;

/** Interpolated range where path crosses `level` between two points. */
function crossing(a: PathPoint, b: PathPoint, level: number): number {
  const f = (level - a.path) / (b.path - a.path);
  return a.range + f * (b.range - a.range);
}

function findCrossings(pts: PathPoint[], level: number) {
  let up: number | null = null;
  let down: number | null = null;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (up === null && a.path < level && b.path >= level) up = crossing(a, b, level);
    if (a.path >= level && b.path < level) {
      down = crossing(a, b, level);
      break;
    }
  }
  return { up, down };
}

function goldenMin(f: (x: number) => number, lo: number, hi: number, tol: number): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  let fc = f(c);
  let fd = f(d);
  while (b - a > tol) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - g * (b - a);
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + g * (b - a);
      fd = f(d);
    }
  }
  return (a + b) / 2;
}

/**
 * The zero minimizing the worst-case deviation from the line of sight over
 * [nearYd, farYd]. Worst-case |path| is convex in bore angle (each range's
 * path is nearly affine in angle), so a golden-section search is exact.
 */
export function findOptimalZero(
  input: ShotInput,
  nearYd: number,
  farYd: number,
  radius: number,
  opts: SearchOptions = {},
): OptimalZeroResult {
  if (!(farYd > nearYd) || nearYd < 0) throw new Error('Shot window must satisfy 0 ≤ near < far');
  const inWindow = (pts: PathPoint[]) =>
    pts.filter((p) => p.range >= nearYd - 1e-9 && p.range <= farYd + 1e-9);
  const cost = (angle: number) => {
    let worst = 0;
    for (const p of inWindow(pathProfile(input, angle, farYd, STEP_YD, opts))) {
      worst = Math.max(worst, Math.abs(p.path));
    }
    return worst;
  };

  const hi =
    boreAngleForZero({ ...input, zeroRange: 10 }, opts.dt) +
    boreAngleForZero({ ...input, zeroRange: farYd }, opts.dt);
  const angle = goldenMin(cost, 0, hi, 1e-8);

  const window = inWindow(pathProfile(input, angle, farYd, STEP_YD, opts));
  let highest = window[0];
  let lowest = window[0];
  for (const p of window) {
    if (p.path > highest.path) highest = p;
    if (p.path < lowest.path) lowest = p;
  }
  const worstDeviation = Math.max(Math.abs(highest.path), Math.abs(lowest.path));

  // Zero crossings may lie beyond the window; look far enough to find them.
  const full = pathProfile(input, angle, Math.max(farYd * 2, 300), STEP_YD, opts);
  const { up, down } = findCrossings(full, 0);

  return {
    zeroRange: down ?? farYd,
    nearZero: up,
    boreAngle: angle,
    worstDeviation,
    highest: { range: highest.range, path: highest.path },
    lowest: { range: lowest.range, path: lowest.path },
    fitsTarget: worstDeviation <= radius,
  };
}

/**
 * Classic MPBR: choose the zero so the trajectory's apex is exactly
 * +radius above the line of sight, then report how far the bullet stays
 * above -radius.
 */
export function maxPointBlankRange(
  input: ShotInput,
  radius: number,
  opts: SearchOptions = {},
): PointBlankResult {
  if (!(radius > 0)) throw new Error('Target radius must be positive');
  const profile = (angle: number) => pathProfile(input, angle, MPBR_MAX_RANGE, STEP_YD, opts);
  const apexOf = (pts: PathPoint[]) => pts.reduce((m, p) => (p.path > m.path ? p : m), pts[0]);

  // Apex height increases monotonically with bore angle: bisect.
  let lo = 0;
  let hi = 0.002;
  while (apexOf(profile(hi)).path < radius) hi *= 2;
  for (let i = 0; i < 60 && hi - lo > 1e-9; i++) {
    const mid = (lo + hi) / 2;
    if (apexOf(profile(mid)).path < radius) lo = mid;
    else hi = mid;
  }
  const angle = (lo + hi) / 2;
  const pts = profile(angle);
  const apex = apexOf(pts);
  const zeros = findCrossings(pts, 0);
  const lower = findCrossings(pts, -radius);

  return {
    radius,
    zeroRange: zeros.down ?? MPBR_MAX_RANGE,
    nearZero: zeros.up,
    boreAngle: angle,
    apexRange: apex.range,
    start: input.sightHeight > radius ? (lower.up ?? 0) : 0,
    end: lower.down ?? MPBR_MAX_RANGE,
  };
}
