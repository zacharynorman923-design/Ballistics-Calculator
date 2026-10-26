// Full trajectory table for a shot.

import { pathProfile } from './path';
import type { ClickSettings, ShotInput, Trajectory } from './types';
import { correctionClicks, energyFtLbs, offsetToMil, offsetToMoa } from './units';
import { boreAngleForZero } from './zero';

export interface TableOptions {
  maxRange: number; // yd
  rangeStep: number; // yd
  clicks: ClickSettings;
  dt?: number;
}

export function solveTrajectory(input: ShotInput, opts: TableOptions): Trajectory {
  const boreAngle = boreAngleForZero(input, opts.dt);
  const pts = pathProfile(input, boreAngle, opts.maxRange, opts.rangeStep, {
    wind: true,
    dt: opts.dt,
  });
  // Wind can deflect vertically a little (head/tail component); the table
  // reports the path in the actual wind, measured against the still-air zero.
  const rows = pts.map((p) => ({
    range: p.range,
    path: p.path,
    pathMoa: offsetToMoa(p.path, p.range),
    pathMil: offsetToMil(p.path, p.range),
    elevationClicks: p.range > 0 ? correctionClicks(p.path, p.range, opts.clicks) : 0,
    velocity: p.velocity,
    energy: energyFtLbs(input.bulletWeight, p.velocity),
    time: p.time,
    windage: p.windage,
    windageMoa: offsetToMoa(p.windage, p.range),
    windageMil: offsetToMil(p.windage, p.range),
    windageClicks: p.range > 0 ? correctionClicks(p.windage, p.range, opts.clicks) : 0,
  }));
  return { boreAngle, rows };
}
