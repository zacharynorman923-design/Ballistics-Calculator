// Public solver API. The UI imports only from here.

export type * from './types';
export { atmosphere, stationPressure, STANDARD_ENV } from './atmosphere';
export type { Atmosphere } from './atmosphere';
export { dragCoefficient } from './dragTables';
export { pathProfile, windVector } from './path';
export type { PathPoint } from './path';
export { solveTrajectory } from './solve';
export type { TableOptions } from './solve';
export { boreAngleForZero } from './zero';
export { findOptimalZero, maxPointBlankRange } from './optimalZero';
export type { OptimalZeroResult, PointBlankResult } from './optimalZero';
export {
  correctionClicks,
  DEFAULT_CLICKS,
  energyFtLbs,
  offsetToMil,
  offsetToMoa,
} from './units';
export { compareLoads } from './loadSwap';
export type { LoadSwapOptions, LoadSwapResult, LoadSwapRow } from './loadSwap';
