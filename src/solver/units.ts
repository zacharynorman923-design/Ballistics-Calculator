// Unit conversions shared by the solver and the UI.

import type { AngleUnit, ClickSettings } from './types';

export const FT_PER_YD = 3;
export const IN_PER_YD = 36;
export const FPS_PER_MPH = 5280 / 3600;
export const GRAVITY = 32.174; // ft/s²
const GRAINS_PER_LB = 7000;

const RAD_PER_MOA = Math.PI / (180 * 60);
const RAD_PER_MIL = 0.001;

/** Kinetic energy in ft-lbs from bullet weight (gr) and velocity (fps). */
export function energyFtLbs(weightGr: number, velocityFps: number): number {
  return (weightGr * velocityFps * velocityFps) / (2 * GRAVITY * GRAINS_PER_LB);
}

/** Angle subtended by an offset (in) at a range (yd), in radians. */
export function offsetToRadians(offsetIn: number, rangeYd: number): number {
  if (rangeYd <= 0) return 0;
  return Math.atan(offsetIn / (rangeYd * IN_PER_YD));
}

export function radiansTo(unit: AngleUnit, rad: number): number {
  return rad / (unit === 'MOA' ? RAD_PER_MOA : RAD_PER_MIL);
}

export function offsetToMoa(offsetIn: number, rangeYd: number): number {
  return radiansTo('MOA', offsetToRadians(offsetIn, rangeYd));
}

export function offsetToMil(offsetIn: number, rangeYd: number): number {
  return radiansTo('MIL', offsetToRadians(offsetIn, rangeYd));
}

/**
 * Clicks needed to move impact onto the line of sight. An impact `offsetIn`
 * below (negative) needs positive (up / right-for-windage) clicks.
 */
export function correctionClicks(offsetIn: number, rangeYd: number, clicks: ClickSettings): number {
  const angle = radiansTo(clicks.unit, offsetToRadians(offsetIn, rangeYd));
  return -angle / clicks.value;
}

export const DEFAULT_CLICKS: Record<AngleUnit, ClickSettings> = {
  MOA: { unit: 'MOA', value: 0.25 },
  MIL: { unit: 'MIL', value: 0.1 },
};
