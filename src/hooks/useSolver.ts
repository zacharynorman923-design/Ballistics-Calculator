import { useMemo } from 'react';
import { DEFAULT_CLICKS, solveTrajectory, type Trajectory } from '../solver';
import { toShot, validate, type AppState } from '../ui/state';

export interface SolveResult {
  trajectory: Trajectory | null;
  error: string | null;
}

/** Solves the trajectory table for the current state, memoized on its inputs. */
export function useTrajectory(state: AppState, zeroRange = state.profile.zeroRange): SolveResult {
  const { profile, env, maxRange, rangeStep, clickUnit } = state;
  return useMemo(() => {
    const invalid = validate(state);
    if (invalid) return { trajectory: null, error: invalid };
    try {
      const trajectory = solveTrajectory(toShot(state, zeroRange), {
        maxRange,
        rangeStep,
        clicks: DEFAULT_CLICKS[clickUnit],
      });
      return { trajectory, error: null };
    } catch (e) {
      return { trajectory: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [profile, env, maxRange, rangeStep, clickUnit, zeroRange]);
}
