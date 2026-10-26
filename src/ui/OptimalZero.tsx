import { useMemo } from 'react';
import { findOptimalZero, maxPointBlankRange } from '../solver';
import { NumberField, Segmented } from './fields';
import { fixed, signed } from './format';
import { toShot, validate, type AppState } from './state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

const TARGETS = [
  { value: 4, label: 'Vitals 4″' },
  { value: 1.25, label: 'Neck/spine 1.25″' },
] as const;

export function OptimalZero({ state, update }: Props) {
  const { profile, env, windowNear, windowFar, targetRadius } = state;
  const result = useMemo(() => {
    const invalid = validate(state);
    if (invalid) return { error: invalid } as const;
    if (!(windowFar > windowNear && windowNear >= 0)) return { error: 'Shot window: far must be beyond near.' } as const;
    if (!(targetRadius > 0)) return { error: 'Target radius must be positive.' } as const;
    try {
      const shot = toShot(state);
      return {
        optimal: findOptimalZero(shot, windowNear, windowFar, targetRadius),
        mpbr: maxPointBlankRange(shot, targetRadius),
      } as const;
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) } as const;
    }
  }, [profile, env, windowNear, windowFar, targetRadius]);

  const isPresetRadius = TARGETS.some((t) => t.value === targetRadius);

  return (
    <div className="stack">
      <div className="card">
        <div className="grid">
          <NumberField label="Window near" unit="yd" value={windowNear} onChange={(v) => update({ windowNear: v })} />
          <NumberField label="Window far" unit="yd" value={windowFar} onChange={(v) => update({ windowFar: v })} />
          <NumberField label="Target radius" unit="in" value={targetRadius} step={0.25} onChange={(v) => update({ targetRadius: v })} />
        </div>
        <Segmented
          value={isPresetRadius ? targetRadius : -1}
          options={[...TARGETS, ...(isPresetRadius ? [] : [{ value: -1, label: `Custom ${targetRadius}″` }])]}
          onChange={(v) => v > 0 && update({ targetRadius: v })}
        />
      </div>

      {'error' in result ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          <div className="card">
            <h3>Best zero for {windowNear}–{windowFar} yd</h3>
            <div className="big-stat">
              <span className="big">{fixed(result.optimal.zeroRange, 0)}</span>
              <span className="unit">yd zero</span>
            </div>
            <dl className="facts">
              <dt>Worst-case miss</dt>
              <dd>±{fixed(result.optimal.worstDeviation, 2)}″</dd>
              <dt>Highest</dt>
              <dd>{signed(result.optimal.highest.path, 2)}″ at {fixed(result.optimal.highest.range, 0)} yd</dd>
              <dt>Lowest</dt>
              <dd>{signed(result.optimal.lowest.path, 2)}″ at {fixed(result.optimal.lowest.range, 0)} yd</dd>
              {result.optimal.nearZero !== null && (
                <>
                  <dt>Near crossing</dt>
                  <dd>{fixed(result.optimal.nearZero, 0)} yd</dd>
                </>
              )}
            </dl>
            <p className={result.optimal.fitsTarget ? 'ok' : 'warn'}>
              {result.optimal.fitsTarget
                ? `✓ Every shot ${windowNear}–${windowFar} yd stays inside the ${targetRadius}″ radius with a center hold.`
                : `⚠ No zero keeps ${windowNear}–${windowFar} yd inside ${targetRadius}″ — shorten the window or plan holdover.`}
            </p>
            <button
              type="button"
              className="primary"
              onClick={() => update({ profile: { ...profile, zeroRange: Math.round(result.optimal.zeroRange) } })}
            >
              Use {fixed(result.optimal.zeroRange, 0)} yd zero
            </button>
          </div>

          <div className="card">
            <h3>Max point-blank range · {targetRadius}″ radius</h3>
            <div className="big-stat">
              <span className="big">{fixed(result.mpbr.end, 0)}</span>
              <span className="unit">yd MPBR</span>
            </div>
            <dl className="facts">
              <dt>Zero at</dt>
              <dd>{fixed(result.mpbr.zeroRange, 0)} yd</dd>
              <dt>Peak +{targetRadius}″ at</dt>
              <dd>{fixed(result.mpbr.apexRange, 0)} yd</dd>
              <dt>Dead-on from</dt>
              <dd>
                {fixed(result.mpbr.start, 0)} to {fixed(result.mpbr.end, 0)} yd
              </dd>
            </dl>
            {result.mpbr.start > 0 && (
              <p className="hint">
                Sight height ({profile.sightHeight}″) exceeds the radius, so the bullet starts below the target zone and enters it at{' '}
                {fixed(result.mpbr.start, 0)} yd.
              </p>
            )}
            <button
              type="button"
              className="primary"
              onClick={() => update({ profile: { ...profile, zeroRange: Math.round(result.mpbr.zeroRange) } })}
            >
              Use {fixed(result.mpbr.zeroRange, 0)} yd zero
            </button>
          </div>
        </>
      )}
    </div>
  );
}
