import { useState } from 'react';
import { useTrajectory } from '../hooks/useSolver';
import { NumberField, Segmented } from './fields';
import { elevClicks, fixed, windClicks } from './format';
import type { AppState } from './state';

interface Props {
  state: AppState;
}

/** "7.9″ high" — where to hold, opposite of where the bullet lands. */
function holdText(path: number): string {
  const s = fixed(Math.abs(path), 1);
  if (Number(s) === 0) return 'center';
  return `${s}″ ${path < 0 ? 'high' : 'low'}`;
}

function windHoldText(windage: number): string {
  const s = fixed(Math.abs(windage), 1);
  if (Number(s) === 0) return '—';
  return `${s}″ ${windage < 0 ? 'right' : 'left'}`;
}

export function HoldoverCard({ state }: Props) {
  const [zero, setZero] = useState(state.profile.zeroRange);
  const [step, setStep] = useState(state.rangeStep >= 50 ? 50 : 25);
  const { trajectory, error } = useTrajectory({ ...state, rangeStep: step }, zero);
  const p = state.profile;
  const env = state.env;
  const showWind = env.windSpeedMph > 0;
  const clickName = state.clickUnit === 'MOA' ? '¼ MOA' : '0.1 MIL';

  return (
    <div className="stack">
      <div className="card no-print row-wrap">
        <NumberField label="Card zero" unit="yd" value={zero} onChange={setZero} />
        <Segmented
          label="Every"
          value={step}
          options={[{ value: 25, label: '25 yd' }, { value: 50, label: '50 yd' }]}
          onChange={setStep}
        />
        <button type="button" onClick={() => window.print()}>Print</button>
      </div>

      {error || !trajectory ? (
        <p className="error">{error}</p>
      ) : (
        <div className="holdover">
          <header>
            <h2>{p.name}</h2>
            <p>
              {p.muzzleVelocity} fps · {p.dragModel} {p.bc} · {zero} yd zero · {clickName} clicks
            </p>
            <p>
              {env.temperatureF}°F · {env.altitudeFt} ft · {env.pressureInHg} inHg
              {showWind ? ` · ${env.windSpeedMph} mph from ${env.windAngleDeg}°` : ''}
            </p>
          </header>
          <ol>
            {trajectory.rows
              .filter((r) => r.range > 0)
              .map((r) => (
                <li key={r.range} className={Math.abs(r.range - zero) < 1e-6 ? 'is-zero' : ''}>
                  <span className="h-range">
                    {fixed(r.range, 0)}
                    <small>yd</small>
                  </span>
                  <span className="h-hold">{holdText(r.path)}</span>
                  <span className="h-clicks">{elevClicks(r.elevationClicks)}</span>
                  {showWind && (
                    <span className="h-wind">
                      {windHoldText(r.windage)}
                      <small>{windClicks(r.windageClicks)}</small>
                    </span>
                  )}
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
