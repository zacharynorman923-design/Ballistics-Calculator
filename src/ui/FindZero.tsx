import { useMemo, useState } from 'react';
import { DEFAULT_CLICKS, zeroFromImpact } from '../solver';
import { NumberField, Segmented } from './fields';
import { elevClicks, fixed, windClicks } from './format';
import { toShot, validate, type AppState } from './state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

export function FindZero({ state, update }: Props) {
  const [range, setRange] = useState(100);
  const [height, setHeight] = useState(1);
  const [high, setHigh] = useState(true);
  const [side, setSide] = useState(0);
  const [right, setRight] = useState(true);
  const [target, setTarget] = useState(state.profile.zeroRange);
  const { profile, env, clickUnit } = state;

  const result = useMemo(() => {
    const invalid = validate(state);
    if (invalid) return { error: invalid } as const;
    if (!(range >= 10)) return { error: 'Distance must be at least 10 yd.' } as const;
    if (!(target >= 10)) return { error: 'Target zero must be at least 10 yd.' } as const;
    if (!(height >= 0) || !(side >= 0)) return { error: 'Enter how far the group is from the aim point.' } as const;
    try {
      return zeroFromImpact(
        toShot(state),
        { rangeYd: range, verticalIn: high ? height : -height, horizontalIn: right ? side : -side },
        DEFAULT_CLICKS[clickUnit],
        target,
      );
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) } as const;
    }
  }, [profile, env, clickUnit, range, height, high, side, right, target]);

  const clickName = clickUnit === 'MOA' ? '¼ MOA' : '0.1 MIL';

  return (
    <div className="stack">
      <div className="card">
        <p className="hint" style={{ marginTop: 0 }}>
          Shoot a 3–5 shot group with <strong>{profile.name}</strong> ({profile.sightHeight}″ sight height) and measure
          from your aim point to the <em>center</em> of the group.
        </p>
        <div className="grid">
          <NumberField label="Distance shot" unit="yd" value={range} onChange={setRange} />
          <NumberField label="Target zero" unit="yd" value={target} onChange={setTarget} />
        </div>
        <div className="grid">
          <NumberField label="Group height" unit="in" value={height} step={0.25} onChange={setHeight} />
          <Segmented
            label="Direction"
            value={high ? 'high' : 'low'}
            options={[{ value: 'high', label: 'High' }, { value: 'low', label: 'Low' }]}
            onChange={(v) => setHigh(v === 'high')}
          />
          <NumberField label="Group sideways" unit="in" value={side} step={0.25} onChange={setSide} />
          <Segmented
            label="Direction"
            value={right ? 'right' : 'left'}
            options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]}
            onChange={(v) => setRight(v === 'right')}
          />
        </div>
      </div>

      {'error' in result ? (
        <p className="error">{result.error}</p>
      ) : (
        <div className="card">
          <h3>You’re zeroed at</h3>
          {result.farZero !== null ? (
            <div className="big-stat">
              <span className="big">{fixed(result.farZero, 0)}</span>
              <span className="unit">yd</span>
            </div>
          ) : (
            <p className="warn">Nowhere: the bullet never rises to your crosshair, so it hits low at every range.</p>
          )}
          <dl className="facts">
            {result.nearZero !== null && (
              <>
                <dt>Near crossing</dt>
                <dd>{fixed(result.nearZero, 0)} yd</dd>
              </>
            )}
            <dt>To zero at {target} yd</dt>
            <dd>
              {elevClicks(result.elevationClicks) === '0'
                ? 'no elevation change'
                : `dial ${elevClicks(result.elevationClicks)} (${clickName})`}
            </dd>
            <dt>Windage</dt>
            <dd>
              {windClicks(result.windageClicks) === '0'
                ? 'no change'
                : `dial ${windClicks(result.windageClicks)} (${clickName})`}
            </dd>
          </dl>
          <p className="hint">
            Depends on your real muzzle velocity and sight height; box velocities are often 50–100 fps faster than a
            hunting-length barrel. After dialing, shoot again to confirm. Wind at the range moves groups sideways too.
          </p>
          <div className="row-wrap">
            {result.farZero !== null && (
              <button
                type="button"
                onClick={() => update({ profile: { ...profile, zeroRange: Math.round(result.farZero!) } })}
              >
                Use current zero ({fixed(result.farZero, 0)} yd)
              </button>
            )}
            <button type="button" className="primary" onClick={() => update({ profile: { ...profile, zeroRange: target } })}>
              I dialed it: set zero to {target} yd
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
