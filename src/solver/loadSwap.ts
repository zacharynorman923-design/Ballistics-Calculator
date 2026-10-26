// Switching loads in a rifle zeroed with a different load.
//
// The scope setting fixes the bore angle relative to the line of sight.
// That angle comes from zeroing load A; load B is fired at the same angle
// from the same sight height. Barrel-dependent point-of-impact shift
// (vibration, jump) isn't modelled, so the result is a starting point to
// confirm on paper.

import { pathProfile } from './path';
import type { ClickSettings, ShotInput } from './types';
import { correctionClicks } from './units';
import { boreAngleForZero } from './zero';

export interface LoadSwapRow {
  range: number; // yd
  pathA: number; // in, zeroed load
  pathB: number; // in, swapped load at A's bore angle
  difference: number; // in, B − A
}

export interface LoadSwapResult {
  boreAngle: number;
  rows: LoadSwapRow[];
  /** B's path at A's zero range, inches. */
  offsetAtZero: number;
  /** Clicks to put B back on at A's zero range: + = up. */
  rezeroClicks: number;
  /** Where B crosses the line of sight with A's scope setting, yd (null if never). */
  nearZeroB: number | null;
  farZeroB: number | null;
}

export interface LoadSwapOptions {
  maxRange: number;
  rangeStep: number;
  clicks: ClickSettings;
  dt?: number;
}

/** Crossing search resolution. */
const SCAN_STEP_YD = 1;

/**
 * `zeroed` is the load the rifle was zeroed with (its zeroRange and
 * sightHeight define the scope setting); `swapped` supplies the other
 * load's ballistics. The swapped load's own zero and sight height are ignored.
 */
export function compareLoads(
  zeroed: ShotInput,
  swapped: ShotInput,
  opts: LoadSwapOptions,
): LoadSwapResult {
  const boreAngle = boreAngleForZero(zeroed, opts.dt);
  const b: ShotInput = { ...swapped, sightHeight: zeroed.sightHeight, env: zeroed.env };
  const pa = pathProfile(zeroed, boreAngle, opts.maxRange, opts.rangeStep, { wind: true, dt: opts.dt });
  const pb = pathProfile(b, boreAngle, opts.maxRange, opts.rangeStep, { wind: true, dt: opts.dt });
  const rows = pa.map((p, i) => ({
    range: p.range,
    pathA: p.path,
    pathB: pb[i].path,
    difference: pb[i].path - p.path,
  }));

  // Still air for the zero-related numbers, matching how zeroing works.
  const zeroRange = zeroed.zeroRange;
  const scan = pathProfile(b, boreAngle, Math.max(opts.maxRange, zeroRange), SCAN_STEP_YD, { dt: opts.dt });
  let nearZeroB: number | null = null;
  let farZeroB: number | null = null;
  for (let i = 1; i < scan.length; i++) {
    const p0 = scan[i - 1];
    const p1 = scan[i];
    const at = p0.range + ((0 - p0.path) / (p1.path - p0.path)) * (p1.range - p0.range);
    if (nearZeroB === null && p0.path < 0 && p1.path >= 0) nearZeroB = at;
    if (p0.path >= 0 && p1.path < 0) {
      farZeroB = at;
      break;
    }
  }
  const atZero = scan.find((p) => Math.abs(p.range - zeroRange) < 1e-6) ?? interpolate(scan, zeroRange);
  const offsetAtZero = atZero.path;

  return {
    boreAngle,
    rows,
    offsetAtZero,
    rezeroClicks: correctionClicks(offsetAtZero, zeroRange, opts.clicks),
    nearZeroB,
    farZeroB,
  };
}

function interpolate(pts: { range: number; path: number }[], range: number) {
  const i = Math.min(pts.length - 1, Math.max(1, pts.findIndex((p) => p.range >= range)));
  const a = pts[i - 1];
  const c = pts[i];
  const f = (range - a.range) / (c.range - a.range);
  return { range, path: a.path + f * (c.path - a.path) };
}
