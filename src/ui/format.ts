// Display formatting shared by the views.

export function fixed(n: number, digits = 1): string {
  const s = n.toFixed(digits);
  // Avoid "-0.0".
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}

export function signed(n: number, digits = 1): string {
  const s = fixed(n, digits);
  return n > 0 && Number(s) !== 0 ? `+${s}` : s;
}

export function int(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** "U 10" / "D 3" / "0" for elevation clicks. */
export function elevClicks(clicks: number): string {
  const c = Math.round(clicks);
  if (c === 0) return '0';
  return `${c > 0 ? 'U' : 'D'} ${Math.abs(c)}`;
}

/** "R 4" / "L 2" for windage clicks. */
export function windClicks(clicks: number): string {
  const c = Math.round(clicks);
  if (c === 0) return '0';
  return `${c > 0 ? 'R' : 'L'} ${Math.abs(c)}`;
}

/** Drift with direction: "2.1 L". */
export function drift(inches: number, digits = 1): string {
  const s = fixed(Math.abs(inches), digits);
  if (Number(s) === 0) return '0';
  return `${s} ${inches < 0 ? 'L' : 'R'}`;
}
