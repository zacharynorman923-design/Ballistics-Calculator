import { useState } from 'react';
import { barrelSettings, barrelVelocityDelta, effectiveVelocity, typicalBarrelIn } from '../data/barrel';
import { cartridgeKey, type LoadProfile } from '../data/presets';
import type { Environment } from '../solver';
import { loadFavorites } from '../storage/profiles';
import { NumberField, Segmented } from './fields';
import { int } from './format';
import { rifleBarrel, type AppState } from './state';

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
  const rifle = rifleBarrel(state);
  const barrel = barrelSettings(p, rifle);
  const delta = barrelVelocityDelta(p, rifle);
  const velocity = effectiveVelocity(p, rifle);
  const setRifle = (patch: Partial<typeof barrel>) =>
    update({
      barrels: {
        ...state.barrels,
        [cartridgeKey(p.cartridge)]: {
          enabled: patch.enabled ?? barrel.enabled,
          barrelIn: patch.barrelIn ?? barrel.barrelIn,
        },
      },
    });

  return (
    <section className="card inputs">
      <button type="button" className="inputs-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>
          {loadFavorites()[p.id] && <span className="field-marker" aria-label="Favorite">★ </span>}
          <strong>{p.name}</strong>
          <span className="muted">
            {' '}
            · {int(velocity)} fps{delta !== 0 ? ` (${barrel.barrelIn}″)` : ''} · {p.dragModel} {p.bc} · {p.zeroRange} yd zero
          </span>
        </span>
        <span className="chev" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="inputs-body">
          <fieldset>
            <legend>Load</legend>
            <div className="grid">
              <NumberField label={barrel.enabled ? 'Box velocity' : 'Muzzle velocity'} unit="fps" value={p.muzzleVelocity} onChange={(v) => setLoad({ muzzleVelocity: v })} />
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
            <legend>Barrel length</legend>
            <label className="field check">
              <input
                type="checkbox"
                checked={barrel.enabled}
                onChange={(e) => setRifle({ enabled: e.target.checked })}
              />
              <span>Adjust box velocity for my {p.cartridge} barrel length</span>
            </label>
            {barrel.enabled && (
              <>
                <div className="grid">
                  <NumberField label="My barrel" unit="in" step={0.5} value={barrel.barrelIn} onChange={(v) => setRifle({ barrelIn: v })} />
                  <NumberField label="Box test barrel" unit="in" step={0.5} value={barrel.testBarrelIn} onChange={(v) => setLoad({ testBarrelIn: v })} />
                  <NumberField label="Change per inch" unit="fps" value={barrel.fpsPerInch} onChange={(v) => setLoad({ fpsPerInch: v })} />
                </div>
                {barrel.barrelIn === typicalBarrelIn(p.cartridge) && (
                  <p className="hint">
                    “My barrel” starts at {typicalBarrelIn(p.cartridge)}″, a common length for {p.cartridge}. Change it to yours.
                  </p>
                )}
                <p className="hint">
                  Using <strong>{int(velocity)} fps</strong>
                  {delta !== 0 && ` (${delta > 0 ? '+' : '−'}${int(Math.abs(delta))} fps from the box ${int(p.muzzleVelocity)})`}. Rule of thumb:
                  about 25 fps per inch, 30 for magnums, 20 for 30-30, 5 for subsonic. A chronograph reading beats any rule:
                  if you have one, untick this and enter it as the muzzle velocity. Your barrel length applies to every{' '}
                  {p.cartridge} load; test barrel and per-inch change belong to this load.
                </p>
              </>
            )}
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
