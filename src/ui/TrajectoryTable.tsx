import type { AngleUnit, Trajectory } from '../solver';
import { drift, elevClicks, fixed, int, signed, windClicks } from './format';

interface Props {
  trajectory: Trajectory;
  clickUnit: AngleUnit;
  showWind: boolean;
}

export function TrajectoryTable({ trajectory, clickUnit, showWind }: Props) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Yd</th>
            <th>Path<small>in</small></th>
            <th>MOA</th>
            <th>MIL</th>
            <th>Clicks<small>{clickUnit === 'MOA' ? '¼ MOA' : '0.1 MIL'}</small></th>
            <th>Vel<small>fps</small></th>
            <th>Energy<small>ft-lb</small></th>
            <th>Time<small>s</small></th>
            {showWind && (
              <>
                <th>Wind<small>in</small></th>
                <th>Wind<small>{clickUnit}</small></th>
                <th>Wind<small>clicks</small></th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {trajectory.rows.map((r) => (
            <tr key={r.range}>
              <th scope="row">{fixed(r.range, 0)}</th>
              <td className={r.path < 0 ? 'neg' : ''}>{signed(r.path)}</td>
              <td>{r.range > 0 ? signed(r.pathMoa, 2) : '—'}</td>
              <td>{r.range > 0 ? signed(r.pathMil, 2) : '—'}</td>
              <td>{r.range > 0 ? elevClicks(r.elevationClicks) : '—'}</td>
              <td>{int(r.velocity)}</td>
              <td>{int(r.energy)}</td>
              <td>{fixed(r.time, 3)}</td>
              {showWind && (
                <>
                  <td>{drift(r.windage)}</td>
                  <td>{r.range > 0 ? drift(clickUnit === 'MOA' ? r.windageMoa : r.windageMil, 2) : '—'}</td>
                  <td>{r.range > 0 ? windClicks(r.windageClicks) : '—'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
