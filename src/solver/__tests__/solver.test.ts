// Physics sanity checks independent of published data.

import { describe, expect, it } from 'vitest';
import {
  atmosphere,
  boreAngleForZero,
  compareLoads,
  zeroFromImpact,
  correctionClicks,
  energyFtLbs,
  findOptimalZero,
  maxPointBlankRange,
  pathProfile,
  solveTrajectory,
  stationPressure,
  STANDARD_ENV,
  type ShotInput,
} from '..';

const ELDX: ShotInput = {
  muzzleVelocity: 2700,
  bc: 0.625,
  dragModel: 'G1',
  bulletWeight: 143,
  sightHeight: 1.5,
  zeroRange: 200,
  env: STANDARD_ENV,
};
const MOA = { unit: 'MOA', value: 0.25 } as const;

const pathAt = (input: ShotInput, range: number) =>
  solveTrajectory(input, { maxRange: range, rangeStep: range, clicks: MOA }).rows.at(-1)!;

describe('integrator', () => {
  it('matches the closed-form vacuum trajectory when drag is negligible', () => {
    const input = { ...ELDX, bc: 1e12 };
    const angle = boreAngleForZero(input);
    const v0 = input.muzzleVelocity;
    for (const p of pathProfile(input, angle, 500, 50)) {
      const x = p.range * 3;
      const y = x * Math.tan(angle) - (32.174 * x * x) / (2 * v0 * v0 * Math.cos(angle) ** 2);
      expect(p.path).toBeCloseTo(y * 12 - input.sightHeight, 3);
    }
  });

  it('is converged at the default time step', () => {
    const coarse = solveTrajectory(ELDX, { maxRange: 600, rangeStep: 100, clicks: MOA });
    const fine = solveTrajectory(ELDX, { maxRange: 600, rangeStep: 100, clicks: MOA, dt: 0.0001 });
    coarse.rows.forEach((r, i) => expect(Math.abs(r.path - fine.rows[i].path)).toBeLessThan(0.005));
  });

  it('starts at -sight height and crosses the line of sight at the zero', () => {
    const t = solveTrajectory({ ...ELDX, zeroRange: 175 }, { maxRange: 300, rangeStep: 25, clicks: MOA });
    expect(t.rows[0].path).toBeCloseTo(-1.5, 6);
    expect(t.rows.find((r) => r.range === 175)!.path).toBeCloseTo(0, 3);
  });

  it('slows monotonically and loses energy', () => {
    const rows = solveTrajectory(ELDX, { maxRange: 800, rangeStep: 50, clicks: MOA }).rows;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].velocity).toBeLessThan(rows[i - 1].velocity);
      expect(rows[i].time).toBeGreaterThan(rows[i - 1].time);
    }
  });

  it('G7 with the box G7 BC agrees with G1 for the ELD-X inside 300 yd', () => {
    const g7 = { ...ELDX, dragModel: 'G7' as const, bc: 0.315 };
    expect(Math.abs(pathAt(g7, 300).path - pathAt(ELDX, 300).path)).toBeLessThan(0.3);
  });
});

describe('atmosphere', () => {
  it('is exactly standard at 59 °F, 29.92 inHg, sea level', () => {
    const a = atmosphere(STANDARD_ENV);
    expect(a.densityRatio).toBeCloseTo(1, 10);
    expect(a.speedOfSound).toBeCloseTo(1116.4, 0);
  });

  it('derives station pressure from altitude', () => {
    expect(stationPressure(29.92, 5000)).toBeCloseTo(24.9, 1);
    const station = { ...STANDARD_ENV, altitudeFt: 5000, pressureInHg: 24.9, pressureIsStation: true };
    const baro = { ...STANDARD_ENV, altitudeFt: 5000 };
    expect(atmosphere(station).densityRatio).toBeCloseTo(atmosphere(baro).densityRatio, 3);
  });

  it('thinner air (altitude, heat) means less drop', () => {
    const at = (env: Partial<typeof STANDARD_ENV>) =>
      pathAt({ ...ELDX, env: { ...STANDARD_ENV, ...env } }, 500).path;
    const sea = at({});
    expect(at({ altitudeFt: 6000 })).toBeGreaterThan(sea);
    expect(at({ temperatureF: 95 })).toBeGreaterThan(sea);
    expect(at({ temperatureF: 10 })).toBeLessThan(sea);
  });
});

describe('wind', () => {
  const windy = (speed: number, angle: number) => ({
    ...ELDX,
    env: { ...STANDARD_ENV, windSpeedMph: speed, windAngleDeg: angle },
  });

  it('full-value wind from the right drifts left; agrees with the lag rule', () => {
    const r = pathAt(windy(10, 90), 300);
    expect(r.windage).toBeLessThan(0);
    // Didion lag rule: drift = W · (t − x / v0).
    const lag = 10 * (5280 / 3600) * (r.time - 900 / 2700) * 12;
    expect(Math.abs(-r.windage - lag) / lag).toBeLessThan(0.03);
    expect(r.windageClicks).toBeGreaterThan(0); // dial right
  });

  it('is symmetric left/right and zero for a pure headwind', () => {
    expect(pathAt(windy(10, 270), 300).windage).toBeCloseTo(-pathAt(windy(10, 90), 300).windage, 6);
    expect(pathAt(windy(10, 0), 300).windage).toBeCloseTo(0, 6);
  });

  it('does not move the zero (rifle is zeroed in still air)', () => {
    expect(pathAt(windy(20, 90), 200).path).toBeCloseTo(0, 3);
  });
});

describe('units', () => {
  it('energy', () => {
    expect(energyFtLbs(143, 2700)).toBeCloseTo(2315, -1);
  });
  it('clicks: 7.9" low at 300 yd ≈ 2.5 MOA ≈ 10 quarter-MOA clicks up', () => {
    expect(correctionClicks(-7.9, 300, MOA)).toBeCloseTo(10.06, 1);
    expect(correctionClicks(-7.9, 300, { unit: 'MIL', value: 0.1 })).toBeCloseTo(7.31, 1);
  });
});

describe('optimal zero / MPBR', () => {
  it('balances high and low extremes over the window and beats a 200 yd zero', () => {
    const r = findOptimalZero(ELDX, 50, 250, 4);
    expect(Math.abs(r.highest.path + r.lowest.path)).toBeLessThan(0.02);
    expect(r.fitsTarget).toBe(true);
    const at200 = pathProfile(ELDX, boreAngleForZero(ELDX), 250, 1)
      .filter((p) => p.range >= 50)
      .reduce((m, p) => Math.max(m, Math.abs(p.path)), 0);
    expect(r.worstDeviation).toBeLessThan(at200);
    expect(r.zeroRange).toBeGreaterThan(150);
    expect(r.zeroRange).toBeLessThan(250);
  });

  it('MPBR keeps the path inside ±radius from start to end', () => {
    for (const radius of [4, 1.25]) {
      const m = maxPointBlankRange(ELDX, radius);
      const pts = pathProfile(ELDX, m.boreAngle, m.end + 20, 1);
      const inside = pts.filter((p) => p.range >= Math.ceil(m.start) && p.range <= Math.floor(m.end));
      for (const p of inside) expect(Math.abs(p.path)).toBeLessThanOrEqual(radius + 1e-3);
      expect(Math.max(...pts.map((p) => p.path))).toBeCloseTo(radius, 2);
      expect(pts.at(-1)!.path).toBeLessThan(-radius);
    }
    // 1.25" radius with a 1.5" sight height: the bullet starts outside.
    expect(maxPointBlankRange(ELDX, 1.25).start).toBeGreaterThan(0);
  });
});

describe('load swap', () => {
  const opts = { maxRange: 400, rangeStep: 50, clicks: MOA };
  const slower: ShotInput = { ...ELDX, muzzleVelocity: 2550, bc: 0.5, bulletWeight: 140, sightHeight: 3, zeroRange: 100 };

  it('is a no-op when both loads are the same', () => {
    const r = compareLoads(ELDX, ELDX, opts);
    r.rows.forEach((row) => expect(row.difference).toBeCloseTo(0, 9));
    expect(r.offsetAtZero).toBeCloseTo(0, 3);
    expect(r.farZeroB).toBeCloseTo(200, 0);
  });

  it('a slower, lower-BC load hits progressively lower and uses the zeroed rifle’s sight height', () => {
    const r = compareLoads(ELDX, slower, opts);
    expect(r.rows[0].pathB).toBeCloseTo(-ELDX.sightHeight, 6);
    for (let i = 2; i < r.rows.length; i++) expect(r.rows[i].difference).toBeLessThan(r.rows[i - 1].difference);
    expect(r.offsetAtZero).toBeLessThan(0);
    expect(r.farZeroB!).toBeLessThan(200);
    expect(r.rezeroClicks).toBeGreaterThan(0);
  });

  it('re-zero clicks equal the bore-angle change needed to zero load B', () => {
    const r = compareLoads(ELDX, slower, opts);
    const own = boreAngleForZero({ ...slower, sightHeight: ELDX.sightHeight, zeroRange: ELDX.zeroRange });
    const moa = ((own - r.boreAngle) * 180 * 60) / Math.PI;
    expect(r.rezeroClicks * 0.25).toBeCloseTo(moa, 1);
  });
});

describe('zero from impact', () => {
  it('recovers a known zero from the path at 100 yd', () => {
    for (const zero of [150, 200, 250]) {
      const at100 = pathAt({ ...ELDX, zeroRange: zero }, 100).path;
      const r = zeroFromImpact(ELDX, { rangeYd: 100, verticalIn: at100, horizontalIn: 0 }, MOA, zero);
      expect(r.farZero!).toBeCloseTo(zero, 0);
      expect(Math.abs(r.elevationClicks)).toBeLessThan(0.05);
    }
  });

  it('reports no zero when the group is low and the bullet never rises to the line of sight', () => {
    const r = zeroFromImpact(ELDX, { rangeYd: 100, verticalIn: -1, horizontalIn: 0 }, MOA, 200);
    expect(r.farZero).toBeNull();
    expect(r.nearZero).toBeNull();
    expect(r.elevationClicks).toBeGreaterThan(0);
  });

  it('clicks move toward the target: high group → dial down; windage centers the group', () => {
    const r = zeroFromImpact(ELDX, { rangeYd: 100, verticalIn: 3, horizontalIn: 1.047 }, MOA, 200);
    expect(r.farZero!).toBeGreaterThan(200);
    expect(r.elevationClicks).toBeLessThan(0);
    expect(r.windageClicks).toBeCloseTo(-4, 1); // 1 MOA right → 4 clicks left
  });
});
