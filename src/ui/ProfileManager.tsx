import { useState } from 'react';
import type { LoadProfile } from '../data/presets';
import {
  deleteProfile,
  isEditedPreset,
  isPreset,
  listProfiles,
  loadFavorites,
  newProfileId,
  saveProfile,
  setFavorite,
  setFavoriteNote,
} from '../storage/profiles';
import { Segmented } from './fields';
import type { AppState } from './state';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
}

export function ProfileManager({ state, update }: Props) {
  const [profiles, setProfiles] = useState(listProfiles);
  const [status, setStatus] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [onlyFavorites, setOnlyFavorites] = useState(() => Object.keys(loadFavorites()).length > 0);
  const current = state.profile;
  const refresh = () => setProfiles(listProfiles());
  const report = (ok: boolean, msg: string) =>
    setStatus(ok ? msg : 'Could not save — browser storage is unavailable (private mode?).');

  const setField = (patch: Partial<LoadProfile>) => update({ profile: { ...current, ...patch } });

  const save = () => {
    report(saveProfile(current), `Saved “${current.name}”.`);
    refresh();
  };
  const saveAsNew = () => {
    const copy = { ...current, id: newProfileId(), name: `${current.name} (copy)`, bcFromBox: false };
    report(saveProfile(copy), `Saved “${copy.name}”.`);
    update({ profile: copy });
    refresh();
  };
  const remove = (p: LoadProfile) => {
    const preset = isPreset(p.id);
    if (!window.confirm(preset ? `Reset “${p.name}” to factory values?` : `Delete “${p.name}”?`)) return;
    deleteProfile(p.id);
    if (!preset) setFavorites(setFavorite(p.id, false));
    const list = listProfiles();
    setProfiles(list);
    if (p.id === current.id) update({ profile: list.find((x) => x.id === p.id) ?? list[0] });
    setStatus(preset ? `Reset “${p.name}”.` : `Deleted “${p.name}”.`);
  };

  const visible = onlyFavorites ? profiles.filter((p) => favorites[p.id]) : profiles;
  const groups = [...visible.reduce((m, p) => m.set(p.cartridge, [...(m.get(p.cartridge) ?? []), p]), new Map<string, LoadProfile[]>())];

  return (
    <div className="stack">
      <div className="card">
        <h3>Current profile</h3>
        <div className="grid">
          <label className="field">
            <span className="field-label">Name</span>
            <input value={current.name} onChange={(e) => setField({ name: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">Cartridge</span>
            <input value={current.cartridge} onChange={(e) => setField({ cartridge: e.target.value })} />
          </label>
          <label className="field wide">
            <span className="field-label">Bullet</span>
            <input value={current.bullet} onChange={(e) => setField({ bullet: e.target.value })} />
          </label>
        </div>
        <div className="row-wrap">
          <button type="button" className="primary" onClick={save}>
            {isPreset(current.id) ? 'Save edits to preset' : 'Save'}
          </button>
          <button type="button" onClick={saveAsNew}>Save as new</button>
        </div>
        {status && <p className="hint" role="status">{status}</p>}
        <p className="hint">Saves load, sight height and zero. Conditions are kept separately as your last-used values.</p>
      </div>

      <div className="row-wrap">
        <Segmented
          value={onlyFavorites ? 'fav' : 'all'}
          options={[
            { value: 'all', label: `All (${profiles.length})` },
            { value: 'fav', label: `★ Favorites (${profiles.filter((p) => favorites[p.id]).length})` },
          ]}
          onChange={(v) => setOnlyFavorites(v === 'fav')}
        />
      </div>

      {groups.length === 0 && (
        <p className="hint">No favorites yet. Tap ☆ next to a load in “All” to add it.</p>
      )}
      {groups.map(([cartridge, list]) => (
        <section key={cartridge} className="stack profile-group">
          <h3 className="group-title">{cartridge}</h3>
          <ul className="profiles">
            {list.map((p) => {
              const fav = favorites[p.id];
              return (
                <li key={p.id} className={p.id === current.id ? 'active' : ''}>
                  <div className="profile-row">
                    <button
                      type="button"
                      className={`star${fav ? ' on' : ''}`}
                      aria-pressed={!!fav}
                      aria-label={fav ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
                      onClick={() => setFavorites(setFavorite(p.id, !fav))}
                    >
                      {fav ? '★' : '☆'}
                    </button>
                    <button type="button" className="profile-pick" onClick={() => update({ profile: p })}>
                      <strong>{p.name}</strong>
                      <span>{p.bullet}</span>
                      <span className="muted">
                        {p.muzzleVelocity} fps · {p.dragModel} {p.bc}
                        {p.bcFromBox ? ' ● BC from box' : ''} · {p.sightHeight}″ SH · {p.zeroRange} yd zero
                        {isPreset(p.id) ? (isEditedPreset(p.id) ? ' · preset (edited)' : ' · preset') : ''}
                      </span>
                    </button>
                    {(!isPreset(p.id) || isEditedPreset(p.id)) && (
                      <button type="button" className="link" onClick={() => remove(p)}>
                        {isPreset(p.id) ? 'Reset' : 'Delete'}
                      </button>
                    )}
                  </div>
                  {fav && (
                    <label className="fav-note">
                      <span className="sr-only">Note for {p.name}</span>
                      <input
                        value={fav.note}
                        placeholder="Note: use / buy / where / price…"
                        onChange={(e) => setFavorites(setFavoriteNote(p.id, e.target.value))}
                      />
                    </label>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
