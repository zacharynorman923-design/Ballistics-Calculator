// Published-data validation: Hornady factory trajectory tables
// (200-yd zero, 1.5" sight height, standard sea-level conditions).

import { describe, expect, it } from 'vitest';
import { presetById } from '../../data/presets';
import { solveTrajectory, STANDARD_ENV, type ShotInput } from '..';

function pathAt(input: ShotInput, ranges: number[]): number[] {
  const t = solveTrajectory(input, {
    maxRange: 300,
    rangeStep: 100,
    clicks: { unit: 'MOA', value: 0.25 },
  });
  return ranges.map((r) => t.rows.find((row) => Math.abs(row.range - r) < 1e-6)!.path);
}

function shot(presetId: string): ShotInput {
  const p = presetById(presetId);
  return {
    muzzleVelocity: p.muzzleVelocity,
    bc: p.bc,
    dragModel: p.dragModel,
    bulletWeight: p.bulletWeight,
    sightHeight: 1.5,
    zeroRange: 200,
    env: STANDARD_ENV,
  };
}

const TOL = 0.3;

describe('Hornady published trajectories (±0.3")', () => {
  it('6.5 Creedmoor 143 gr ELD-X: +1.9 @100, 0 @200, -7.9 @300', () => {
    const [p100, p200, p300] = pathAt(shot('preset-65cm-143-eldx'), [100, 200, 300]);
    expect(Math.abs(p100 - 1.9)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p200 - 0)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p300 - -7.9)).toBeLessThanOrEqual(TOL);
  });

  it('30-30 160 gr FTX: +3.0 @100, 0 @200, -12.1 @300', () => {
    const [p100, p200, p300] = pathAt(shot('preset-3030-160-ftx'), [100, 200, 300]);
    expect(Math.abs(p100 - 3.0)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p200 - 0)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p300 - -12.1)).toBeLessThanOrEqual(TOL);
  });
});
