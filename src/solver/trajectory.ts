// RK4 point-mass integrator.
//
// Coordinates (feet): x downrange along the line of sight, y up, z right.
// The bore starts at the origin; the line of sight is the horizontal line
// y = sightHeight. Wind is an air-mass velocity, and drag acts along the
// bullet's velocity relative to the air.

import { dragCoefficient } from './dragTables';
import type { Atmosphere } from './atmosphere';
import type { DragModel } from './types';
import { GRAVITY } from './units';

/**
 * Drag deceleration = Cd · ρ · v² · A / (2 · BC), with A the cross-section
 * of the 1-inch, 1-lb standard projectile. A / 2 in ft²:
 */
const HALF_STD_AREA = Math.PI / 4 / 144 / 2;

export const DEFAULT_DT = 0.0005; // s

export interface IntegrationInput {
  muzzleVelocity: number; // fps
  bc: number;
  dragModel: DragModel;
  /** Bore elevation above the line of sight, radians. */
  boreAngle: number;
  atmosphere: Atmosphere;
  /** Air-mass velocity, ft/s (x: + toward target, z: + toward right). */
  windX: number;
  windZ: number;
  /** Positions at which to sample: 0, step, 2·step, … ≤ maxX (feet). */
  sampleStepFt: number;
  maxXFt: number;
  dt?: number;
}

export interface Sample {
  x: number; // ft
  y: number; // ft (bore frame; LOS is at y = sightHeight)
  z: number; // ft
  v: number; // fps
  t: number; // s
}

/** Stop if the bullet slows below this, or flies longer than MAX_TIME. */
const MIN_VELOCITY = 50;
const MAX_TIME = 30;

export function integrate(input: IntegrationInput): Sample[] {
  const dt = input.dt ?? DEFAULT_DT;
  const { densityRatio, speedOfSound } = input.atmosphere;
  const rho = densityRatio * 0.0764742;
  const kDrag = (rho * HALF_STD_AREA) / input.bc;
  const { dragModel, windX, windZ } = input;

  // Acceleration for a velocity; writes into out[0..2].
  const acc = (vx: number, vy: number, vz: number, out: number[]) => {
    const rx = vx - windX;
    const ry = vy;
    const rz = vz - windZ;
    const vr = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const k = kDrag * dragCoefficient(dragModel, vr / speedOfSound) * vr;
    out[0] = -k * rx;
    out[1] = -k * ry - GRAVITY;
    out[2] = -k * rz;
  };

  let x = 0;
  let y = 0;
  let z = 0;
  let vx = input.muzzleVelocity * Math.cos(input.boreAngle);
  let vy = input.muzzleVelocity * Math.sin(input.boreAngle);
  let vz = 0;
  let t = 0;

  const samples: Sample[] = [{ x: 0, y: 0, z: 0, v: input.muzzleVelocity, t: 0 }];
  const step = input.sampleStepFt;
  let nextX = step;

  const a1 = [0, 0, 0];
  const a2 = [0, 0, 0];
  const a3 = [0, 0, 0];
  const a4 = [0, 0, 0];
  const h = dt;

  while (nextX <= input.maxXFt + 1e-9 && t < MAX_TIME) {
    // RK4 on the state (position, velocity); position' = velocity.
    acc(vx, vy, vz, a1);
    const v2x = vx + 0.5 * h * a1[0];
    const v2y = vy + 0.5 * h * a1[1];
    const v2z = vz + 0.5 * h * a1[2];
    acc(v2x, v2y, v2z, a2);
    const v3x = vx + 0.5 * h * a2[0];
    const v3y = vy + 0.5 * h * a2[1];
    const v3z = vz + 0.5 * h * a2[2];
    acc(v3x, v3y, v3z, a3);
    const v4x = vx + h * a3[0];
    const v4y = vy + h * a3[1];
    const v4z = vz + h * a3[2];
    acc(v4x, v4y, v4z, a4);

    const nx = x + (h / 6) * (vx + 2 * v2x + 2 * v3x + v4x);
    const ny = y + (h / 6) * (vy + 2 * v2y + 2 * v3y + v4y);
    const nz = z + (h / 6) * (vz + 2 * v2z + 2 * v3z + v4z);
    const nvx = vx + (h / 6) * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]);
    const nvy = vy + (h / 6) * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1]);
    const nvz = vz + (h / 6) * (a1[2] + 2 * a2[2] + 2 * a3[2] + a4[2]);
    const nt = t + h;

    // Emit every sample point crossed during this step (linear interpolation
    // in x; the step is ~1 ft so the error is far below 0.001").
    while (nextX <= nx && nextX <= input.maxXFt + 1e-9) {
      const f = (nextX - x) / (nx - x);
      const sv = Math.hypot(vx, vy, vz);
      const nv = Math.hypot(nvx, nvy, nvz);
      samples.push({
        x: nextX,
        y: y + f * (ny - y),
        z: z + f * (nz - z),
        v: sv + f * (nv - sv),
        t: t + f * h,
      });
      nextX = step * samples.length;
    }

    x = nx;
    y = ny;
    z = nz;
    vx = nvx;
    vy = nvy;
    vz = nvz;
    t = nt;
    if (vx < MIN_VELOCITY) break;
  }
  return samples;
}
