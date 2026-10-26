// Bullet path relative to the line of sight for a given bore angle.

import { atmosphere } from './atmosphere';
import { integrate } from './trajectory';
import type { Environment, ShotInput } from './types';
import { FPS_PER_MPH, FT_PER_YD } from './units';

export interface PathPoint {
  range: number; // yd
  path: number; // in, + above LOS
  windage: number; // in, + right
  velocity: number; // fps
  time: number; // s
}

export interface PathOptions {
  /** Include wind. Zeroing is done in still air. */
  wind?: boolean;
  dt?: number;
}

/** Air-mass velocity components (ft/s) for the wind in `env`. */
export function windVector(env: Environment): { x: number; z: number } {
  const speed = env.windSpeedMph * FPS_PER_MPH;
  const a = (env.windAngleDeg * Math.PI) / 180;
  // Wind FROM angle a (clockwise from the target): air moves toward -a.
  return { x: -speed * Math.cos(a), z: -speed * Math.sin(a) };
}

export function pathProfile(
  input: ShotInput,
  boreAngle: number,
  maxRangeYd: number,
  stepYd: number,
  opts: PathOptions = {},
): PathPoint[] {
  const wind = opts.wind ? windVector(input.env) : { x: 0, z: 0 };
  const samples = integrate({
    muzzleVelocity: input.muzzleVelocity,
    bc: input.bc,
    dragModel: input.dragModel,
    boreAngle,
    atmosphere: atmosphere(input.env),
    windX: wind.x,
    windZ: wind.z,
    sampleStepFt: stepYd * FT_PER_YD,
    maxXFt: maxRangeYd * FT_PER_YD,
    dt: opts.dt,
  });
  const sh = input.sightHeight;
  return samples.map((s) => ({
    range: s.x / FT_PER_YD,
    path: s.y * 12 - sh,
    windage: s.z * 12,
    velocity: s.v,
    time: s.t,
  }));
}
