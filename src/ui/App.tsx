import { useEffect, useState } from 'react';
import { useTrajectory } from '../hooks/useSolver';
import { loadState, saveState } from '../storage/profiles';
import { HoldoverCard } from './HoldoverCard';
import { InputsPanel } from './InputsPanel';
import { LoadSwap } from './LoadSwap';
import { Segmented } from './fields';
import { OptimalZero } from './OptimalZero';
import { PathChart } from './PathChart';
import { ProfileManager } from './ProfileManager';
import { DEFAULT_STATE, type AppState, type TabId } from './state';
import { TrajectoryTable } from './TrajectoryTable';
import { ZeroComparison } from './ZeroComparison';

const TABS: { id: TabId; label: string }[] = [
  { id: 'table', label: 'Table' },
  { id: 'zeros', label: 'Zeros' },
  { id: 'optimal', label: 'Optimal' },
  { id: 'card', label: 'Card' },
  { id: 'chart', label: 'Chart' },
  { id: 'profiles', label: 'Profiles' },
];

export function App() {
  const [state, setState] = useState<AppState>(() => loadState(DEFAULT_STATE));
  const update = (patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch }));
  useEffect(() => saveState(state), [state]);
  const { trajectory, error } = useTrajectory(state);

  return (
    <div className="app">
      <header className="topbar no-print">
        <h1>Ballistics</h1>
        <nav className="tabs" aria-label="Views">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={state.tab === t.id ? 'on' : ''}
              aria-current={state.tab === t.id ? 'page' : undefined}
              onClick={() => update({ tab: t.id })}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {state.tab !== 'profiles' && (
          <div className="no-print">
            <InputsPanel state={state} update={update} />
          </div>
        )}
        {error && state.tab !== 'profiles' && <p className="error">{error}</p>}
        {state.tab === 'table' && trajectory && (
          <TrajectoryTable trajectory={trajectory} clickUnit={state.clickUnit} showWind={state.env.windSpeedMph > 0} />
        )}
        {state.tab === 'zeros' && (
          <>
            <Segmented
              value={state.zerosMode}
              options={[
                { value: 'distances', label: 'Zero distances' },
                { value: 'loads', label: 'Switch loads' },
              ]}
              onChange={(v) => update({ zerosMode: v })}
            />
            {state.zerosMode === 'distances' ? (
              <ZeroComparison state={state} update={update} />
            ) : (
              <LoadSwap state={state} update={update} />
            )}
          </>
        )}
        {state.tab === 'optimal' && <OptimalZero state={state} update={update} />}
        {state.tab === 'card' && <HoldoverCard state={state} />}
        {state.tab === 'chart' && trajectory && <PathChart state={state} trajectory={trajectory} />}
        {state.tab === 'profiles' && <ProfileManager state={state} update={update} />}
      </main>
    </div>
  );
}
