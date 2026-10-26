import { useMemo, useState } from 'react';
import { cartridgeKey, type LoadProfile } from '../data/presets';
import { compareLoads, DEFAULT_CLICKS } from '../solver';
import { listProfiles } from '../storage/profiles';
import { elevClicks, fixed, signed } from './format';
import { toShot, validate, type AppState } from './state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

function hitText(path: number): string {
  const s = fixed(Math.abs(path), 1);
  if (Number(s) === 0) return 'dead on';
  return `${s}″ ${path > 0 ? 'high' : 'low'}`;
}

export function LoadSwap({ state, update }: Props) {
  const [allCalibers, setAllCalibers] = useState(false);
  const zeroed = state.profile;
  const key = cartridgeKey(zeroed.cartridge);
  const candidates = useMemo(
    () =>
      listProfiles().filter(
        (p) => p.id !== zeroed.id && (allCalibers || cartridgeKey(p.cartridge) === key),
      ),
    [zeroed.id, key, allCalibers],
  );
  const other: LoadProfile | undefined =
    candidates.find((p) => p.id === state.swapProfileId) ?? candidates[0];

  const { env, maxRange, rangeStep, clickUnit } = state;
  const result = useMemo(() => {
    if (!other) return null;
    const invalid = validate(state) ?? validate({ ...state, profile: other });
    if (invalid) return { error: invalid } as const;
    try {
      return compareLoads(toShot(state), toShot({ ...state, profile: other }), {
        maxRange,
        rangeStep,
        clicks: DEFAULT_CLICKS[clickUnit],
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) } as const;
    }
  }, [zeroed, other, env, maxRange, rangeStep, clickUnit]);

  const clickName = clickUnit === 'MOA' ? '¼ MOA' : '0.1 MIL';

  return (
    <div className="stack">
      <div className="card">
        <p className="hint" style={{ marginTop: 0 }}>
          Zeroed with <strong>{zeroed.name}</strong> at {zeroed.zeroRange} yd ({zeroed.sightHeight}″ sight height).
          Pick the load you’re switching to:
        </p>
        <label className="field">
          <span className="field-label">Switching to</span>
          {candidates.length ? (
            <select
              className="select"
              value={other?.id ?? ''}
              onChange={(e) => update({ swapProfileId: e.target.value })}
            >
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.muzzleVelocity} fps, {p.dragModel} {p.bc}
                </option>
              ))}
            </select>
          ) : (
            <span className="hint">
              No other {zeroed.cartridge} loads saved. Add one under Profiles, or show all calibers.
            </span>
          )}
        </label>
        <label className="field check">
          <input type="checkbox" checked={allCalibers} onChange={(e) => setAllCalibers(e.target.checked)} />
          <span>Show all calibers</span>
        </label>
      </div>

      {result && 'error' in result && <p className="error">{result.error}</p>}
      {result && !('error' in result) && other && (
        <>
          <div className="card">
            <h3>{other.name} with your {zeroed.name} zero</h3>
            <dl className="facts">
              <dt>At {zeroed.zeroRange} yd</dt>
              <dd>{hitText(result.offsetAtZero)}</dd>
              <dt>Crosses crosshair</dt>
              <dd>
                {[result.nearZeroB, result.farZeroB]
                  .filter((z): z is number => z !== null)
                  .map((z) => `${fixed(z, 0)} yd`)
                  .join(' and ') || 'never (always low)'}
              </dd>
              <dt>To re-zero at {zeroed.zeroRange}</dt>
              <dd>
                {elevClicks(result.rezeroClicks) === '0'
                  ? 'no change'
                  : `dial ${elevClicks(result.rezeroClicks)} (${clickName})`}
              </dd>
            </dl>
            <p className="hint">
              Assumes both loads leave the barrel at the same angle. Real rifles often shift point of impact between
              loads by an inch or more at 100 yd, so confirm on paper before hunting.
            </p>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Yd</th>
                  <th>
                    {zeroed.name}
                    <small>zeroed, in</small>
                  </th>
                  <th>
                    {other.name}
                    <small>same scope, in</small>
                  </th>
                  <th>
                    Diff
                    <small>in</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.range}>
                    <th scope="row">{fixed(r.range, 0)}</th>
                    <td>{signed(r.pathA)}</td>
                    <td>{signed(r.pathB)}</td>
                    <td>{r.range > 0 ? signed(r.difference) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
