// Published-data validation: Hornady factory trajectory tables
// (200-yd zero, 1.5" sight height, standard sea-level conditions).
//
// Reference values are from Hornady's product pages:
//   6.5 CM 143 ELD-X Precision Hunter (#81499): 2700/2557/2419/2285 fps,
//     path -1.5/+1.9/0/-7.9 in.
//   30-30 160 FTX LEVERevolution (#82730): 2400/2151/1917/1700 fps,
//     path -1.5/+3/0/-12.5 in. (Some retailer copy shows -12.1 at 300 yd;
//     Hornady's own table is -12.5.)

import { describe, expect, it } from 'vitest';
import { presetById } from '../../data/presets';
import { solveTrajectory, STANDARD_ENV, type ShotInput } from '..';

function rowsAt(input: ShotInput, ranges: number[]) {
  const t = solveTrajectory(input, {
    maxRange: 300,
    rangeStep: 100,
    clicks: { unit: 'MOA', value: 0.25 },
  });
  return ranges.map((r) => t.rows.find((row) => Math.abs(row.range - r) < 1e-6)!);
}

const pathAt = (input: ShotInput, ranges: number[]) => rowsAt(input, ranges).map((r) => r.path);

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

  it('30-30 160 gr FTX: +3.0 @100, 0 @200, -12.5 @300', () => {
    const [p100, p200, p300] = pathAt(shot('preset-3030-160-ftx'), [100, 200, 300]);
    expect(Math.abs(p100 - 3.0)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p200 - 0)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(p300 - -12.5)).toBeLessThanOrEqual(TOL);
  });
});

// Published velocities at 100/200/300 yd. 7mm Rem Mag: Remington R7MM2 and
// Federal 7RA from the makers' product pages; Winchester X7MMR1 from a
// retailer's reproduction of Winchester's table. 270 Win: Federal 270A from
// a retailer's reproduction of Federal's table.
describe('Published velocities (±15 fps)', () => {
  it.each([
    ['preset-65cm-143-eldx', [2557, 2419, 2285]],
    ['preset-3030-160-ftx', [2151, 1917, 1700]],
    ['preset-7rm-150-corelokt', [2831, 2568, 2321]],
    ['preset-7rm-150-powerpoint', [2831, 2587, 2356]],
    ['preset-7rm-150-powershok', [2872, 2647, 2432]],
    ['preset-270-130-powershok', [2803, 2560, 2329]],
  ] as const)('%s', (id, expected) => {
    rowsAt(shot(id), [100, 200, 300]).forEach((row, i) => {
      expect(Math.abs(row.velocity - expected[i])).toBeLessThanOrEqual(15);
    });
  });
});
