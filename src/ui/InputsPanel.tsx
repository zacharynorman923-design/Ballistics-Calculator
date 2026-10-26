import { useState } from 'react';
import type { LoadProfile } from '../data/presets';
import type { Environment } from '../solver';
import { NumberField, Segmented } from './fields';
import type { AppState } from './state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

export function InputsPanel({ state, update }: Props) {
  const [open, setOpen] = useState(true);
  const p = state.profile;
  const env = state.env;
  const setLoad = (patch: Partial<LoadProfile>) => update({ profile: { ...p, ...patch } });
  const setEnv = (patch: Partial<Environment>) => update({ env: { ...env, ...patch } });

  return (
    <section className="card inputs">
      <button type="button" className="inputs-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>
          <strong>{p.name}</strong>
          <span className="muted">
            {' '}
            · {p.muzzleVelocity} fps · {p.dragModel} {p.bc} · {p.zeroRange} yd zero
          </span>
        </span>
        <span className="chev" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="inputs-body">
          <fieldset>
            <legend>Load</legend>
            <div className="grid">
              <NumberField label="Muzzle velocity" unit="fps" value={p.muzzleVelocity} onChange={(v) => setLoad({ muzzleVelocity: v })} />
              <NumberField
                label="BC"
                value={p.bc}
                step={0.001}
                onChange={(v) => setLoad({ bc: v })}
                marker={p.bcFromBox ? 'Confirm this BC against your ammo box' : undefined}
              />
              <Segmented label="Drag model" value={p.dragModel} options={[{ value: 'G1', label: 'G1' }, { value: 'G7', label: 'G7' }]} onChange={(v) => setLoad({ dragModel: v })} />
              <NumberField label="Bullet weight" unit="gr" value={p.bulletWeight} onChange={(v) => setLoad({ bulletWeight: v })} />
            </div>
            {p.bcFromBox && <p className="hint"><span className="field-marker">●</span> BC from the box — confirm and edit. {p.notes}</p>}
          </fieldset>

          <fieldset>
            <legend>Rifle &amp; table</legend>
            <div className="grid">
              <NumberField label="Sight height" unit="in" value={p.sightHeight} step={0.1} onChange={(v) => setLoad({ sightHeight: v })} />
              <NumberField label="Zero range" unit="yd" value={p.zeroRange} onChange={(v) => setLoad({ zeroRange: v })} />
              <NumberField label="Max range" unit="yd" value={state.maxRange} onChange={(v) => update({ maxRange: v })} />
              <NumberField label="Range step" unit="yd" value={state.rangeStep} onChange={(v) => update({ rangeStep: v })} />
              <Segmented
                label="Clicks"
                value={state.clickUnit}
                options={[{ value: 'MOA', label: '¼ MOA' }, { value: 'MIL', label: '0.1 MIL' }]}
                onChange={(v) => update({ clickUnit: v })}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Conditions</legend>
            <div className="grid">
              <NumberField label="Wind speed" unit="mph" value={env.windSpeedMph} onChange={(v) => setEnv({ windSpeedMph: v })} />
              <NumberField label="Wind from" unit="°" value={env.windAngleDeg} onChange={(v) => setEnv({ windAngleDeg: v })} />
              <NumberField label="Temperature" unit="°F" value={env.temperatureF} onChange={(v) => setEnv({ temperatureF: v })} />
              <NumberField label="Altitude" unit="ft" value={env.altitudeFt} onChange={(v) => setEnv({ altitudeFt: v })} />
              <NumberField label="Pressure" unit="inHg" value={env.pressureInHg} step={0.01} onChange={(v) => setEnv({ pressureInHg: v })} />
              <label className="field check">
                <input type="checkbox" checked={env.pressureIsStation} onChange={(e) => setEnv({ pressureIsStation: e.target.checked })} />
                <span>Station pressure (Kestrel / absolute)</span>
              </label>
            </div>
            <p className="hint">
              Wind from: 90° = full value from the right (3 o’clock), 270° = from the left, 0° = headwind.
              {' '}
              {env.pressureIsStation
                ? 'Pressure is absolute; altitude is ignored for air density.'
                : 'Pressure is the weather-report (sea-level) reading; altitude converts it to station pressure.'}
            </p>
            <button
              type="button"
              className="link"
              onClick={() => setEnv({ temperatureF: 59, altitudeFt: 0, pressureInHg: 29.92, pressureIsStation: false })}
            >
              Reset to standard (59 °F, sea level, 29.92 inHg)
            </button>
          </fieldset>
        </div>
      )}
    </section>
  );
}
