import { useMemo } from 'react';
import { DEFAULT_CLICKS, solveTrajectory } from '../solver';
import { NumberField } from './fields';
import { signed } from './format';
import { toShot, type AppState } from './state';

const FIXED_ZEROS = [100, 150, 175, 200];

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

export function ZeroComparison({ state, update }: Props) {
  const zeros = [...FIXED_ZEROS, state.customZero];
  const { profile, env, maxRange, rangeStep, clickUnit, targetRadius } = state;
  const columns = useMemo(
    () =>
      zeros.map((z) => {
        try {
          return solveTrajectory(toShot(state, z), { maxRange, rangeStep, clicks: DEFAULT_CLICKS[clickUnit] }).rows;
        } catch {
          return null;
        }
      }),
    // zeros is derived from customZero
    [profile, env, maxRange, rangeStep, clickUnit, state.customZero],
  );
  const ranges = columns.find((c) => c)?.map((r) => r.range) ?? [];

  return (
    <div className="stack">
      <div className="card row-wrap">
        <NumberField label="Custom zero" unit="yd" value={state.customZero} onChange={(v) => update({ customZero: v })} />
        <NumberField label="Target radius" unit="in" value={targetRadius} step={0.25} onChange={(v) => update({ targetRadius: v })} />
        <p className="hint grow">
          Path in inches above (+) or below (−) line of sight. Values outside ±{targetRadius}″ are struck through; the zero
          is boxed. Tap a column header to use that zero.
        </p>
      </div>
      <div className="table-wrap">
        <table className="data compare">
          <thead>
            <tr>
              <th>Yd</th>
              {zeros.map((z, i) => (
                <th key={i}>
                  <button type="button" className="th-btn" onClick={() => update({ profile: { ...profile, zeroRange: z } })}>
                    {z}
                    <small>{i === zeros.length - 1 ? 'custom' : 'zero'}</small>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranges.map((range, ri) => (
              <tr key={range}>
                <th scope="row">{range}</th>
                {columns.map((col, ci) => {
                  if (!col) return <td key={ci}>—</td>;
                  const p = col[ri].path;
                  const isZero = Math.abs(range - zeros[ci]) < 1e-6;
                  const out = Math.abs(p) > targetRadius && range > 0;
                  return (
                    <td key={ci} className={[isZero ? 'zero' : '', out ? 'out' : '', p < 0 ? 'neg' : ''].join(' ')}>
                      {signed(p)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
