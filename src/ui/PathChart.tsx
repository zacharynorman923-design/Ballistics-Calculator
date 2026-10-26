import { useEffect, useMemo, useRef, useState } from 'react';
import { pathProfile, type Trajectory } from '../solver';
import { fixed, int, signed } from './format';
import { toShot, type AppState } from './state';

interface Props {
  state: AppState;
  trajectory: Trajectory;
}

const HEIGHT = 280;
const M = { top: 16, right: 16, bottom: 34, left: 44 };

function niceStep(span: number, target: number): number {
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

function ticks(min: number, max: number, target: number): number[] {
  const s = niceStep(max - min, target);
  const out: number[] = [];
  for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

export function PathChart({ state, trajectory }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { profile, env, maxRange, targetRadius } = state;
  const pts = useMemo(
    () => pathProfile(toShot(state), trajectory.boreAngle, maxRange, Math.max(1, Math.round(maxRange / 250)), { wind: true }),
    [profile, env, maxRange, trajectory],
  );

  const yMin = Math.min(-targetRadius, ...pts.map((p) => p.path));
  const yMax = Math.max(targetRadius, ...pts.map((p) => p.path));
  const pad = (yMax - yMin) * 0.06;
  const w = width - M.left - M.right;
  const h = HEIGHT - M.top - M.bottom;
  const xs = (r: number) => M.left + (r / maxRange) * w;
  const ys = (v: number) => M.top + ((yMax + pad - v) / (yMax - yMin + 2 * pad)) * h;

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(p.range).toFixed(1)},${ys(p.path).toFixed(1)}`).join('');
  const zeros: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if ((a.path < 0) !== (b.path < 0)) zeros.push(a.range + ((0 - a.path) / (b.path - a.path)) * (b.range - a.range));
  }
  const hp = hover === null ? null : pts[hover];

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const r = ((e.clientX - box.left) / box.width) * maxRange;
    const step = pts[1] ? pts[1].range - pts[0].range : 1;
    setHover(Math.max(0, Math.min(pts.length - 1, Math.round(r / step))));
  };

  return (
    <div className="card chart" ref={wrap}>
      <h3>Bullet path vs. line of sight</h3>
      <p className="hint">
        {profile.name}, {profile.zeroRange} yd zero. Crosses line of sight at{' '}
        {zeros.map((z) => `${fixed(z, 0)} yd`).join(' and ') || '—'}. Shaded band: ±{targetRadius}″ target radius.
      </p>
      <div className="readout" aria-live="polite">
        {hp ? (
          <>
            <strong>{fixed(hp.range, 0)} yd</strong>
            <span>{signed(hp.path)}″ path</span>
            <span>{int(hp.velocity)} fps</span>
            <span>{fixed(hp.time, 3)} s</span>
          </>
        ) : (
          <span className="muted">Touch the chart to read values.</span>
        )}
      </div>
      <svg width={width} height={HEIGHT} role="img" aria-label="Bullet path in inches relative to line of sight, by range in yards">
        <rect x={M.left} y={ys(targetRadius)} width={w} height={ys(-targetRadius) - ys(targetRadius)} className="band" />
        {ticks(yMin, yMax, 5).map((v) => (
          <g key={`y${v}`}>
            <line x1={M.left} x2={M.left + w} y1={ys(v)} y2={ys(v)} className="grid" />
            <text x={M.left - 6} y={ys(v)} className="tick" textAnchor="end" dominantBaseline="middle">
              {v}
            </text>
          </g>
        ))}
        {ticks(0, maxRange, Math.max(3, Math.floor(w / 70))).map((v) => (
          <text key={`x${v}`} x={xs(v)} y={HEIGHT - M.bottom + 16} className="tick" textAnchor="middle">
            {v}
          </text>
        ))}
        <text x={M.left + w} y={HEIGHT - 4} className="tick" textAnchor="end">yd</text>
        <text x={4} y={M.top - 4} className="tick">in</text>

        <line x1={M.left} x2={M.left + w} y1={ys(0)} y2={ys(0)} className="los" />
        <text x={M.left + w - 2} y={ys(0) - 5} className="label" textAnchor="end">line of sight</text>

        <path d={line} className="series" />
        {zeros.map((z) => (
          <circle key={z} cx={xs(z)} cy={ys(0)} r={4} className="marker" />
        ))}

        {hp && (
          <g pointerEvents="none">
            <line x1={xs(hp.range)} x2={xs(hp.range)} y1={M.top} y2={M.top + h} className="crosshair" />
            <circle cx={xs(hp.range)} cy={ys(hp.path)} r={4.5} className="marker" />
          </g>
        )}
        <rect
          x={M.left}
          y={M.top}
          width={w}
          height={h}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        />
      </svg>
    </div>
  );
}
