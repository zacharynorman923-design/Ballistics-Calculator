// Rifle/load profiles and last-used app state in localStorage.
// Every access is wrapped: storage may be unavailable (private mode) and
// the app must work without it.

import { PRESETS, type LoadProfile } from '../data/presets';

const PROFILES_KEY = 'ballistics.profiles.v1';
const STATE_KEY = 'ballistics.state.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Saved profiles keyed by id. A preset's id here is an edited copy of it. */
function stored(): Record<string, LoadProfile> {
  return read<Record<string, LoadProfile>>(PROFILES_KEY, {});
}

export function isPreset(id: string): boolean {
  return PRESETS.some((p) => p.id === id);
}

/** Presets (with any saved edits applied) followed by the user's own profiles. */
export function listProfiles(): LoadProfile[] {
  const saved = stored();
  const presets = PRESETS.map((p) => saved[p.id] ?? p);
  const own = Object.values(saved).filter((p) => !isPreset(p.id));
  own.sort((a, b) => a.name.localeCompare(b.name));
  return [...presets, ...own];
}

export function isEditedPreset(id: string): boolean {
  return isPreset(id) && id in stored();
}

export function saveProfile(profile: LoadProfile): boolean {
  return write(PROFILES_KEY, { ...stored(), [profile.id]: profile });
}

/** Deletes a user profile, or resets a preset to its factory values. */
export function deleteProfile(id: string): boolean {
  const all = stored();
  delete all[id];
  return write(PROFILES_KEY, all);
}

export function newProfileId(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function loadState<T>(fallback: T): T {
  return { ...fallback, ...read<Partial<T>>(STATE_KEY, {}) };
}

export function saveState(state: unknown): void {
  write(STATE_KEY, state);
}
