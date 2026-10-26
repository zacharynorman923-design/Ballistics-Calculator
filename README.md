# Hunting Ballistics Calculator

Mobile-first PWA (React + Vite + TypeScript). It works offline once loaded, and
you can install it from your phone's browser with "Add to Home Screen".
All units are imperial.

```
npm install
npm run dev       # local dev server
npm test          # solver tests (Vitest)
npm run build     # production build + service worker → dist/
npm run preview   # serve dist/ (use --host to open it from your phone)
```

## Layout

- `src/solver/` is the pure TypeScript ballistics engine: no React, no browser APIs.
  - `dragTables.ts`: standard G1/G7 Cd vs. Mach tables
  - `atmosphere.ts`: air-density ratio and speed of sound from °F, altitude and inHg
  - `trajectory.ts`: RK4 point-mass integrator (dt = 0.5 ms; wind is an air-mass velocity)
  - `zero.ts`: bore angle for a zero range (Newton iteration, in still air)
  - `solve.ts`: trajectory table (path, MOA/MIL, clicks, velocity, energy, TOF, wind)
  - `optimalZero.ts`: minimax zero for a shot window, and max point-blank range
- `src/data/presets.ts`: preset loads. BCs marked `bcFromBox` should be checked against the box.
- `src/storage/profiles.ts`: localStorage profiles and last-used state
- `src/ui/`: views (Table, Zeros, Optimal, Card, Chart, Profiles)

## Conventions

- **Path** is inches above (+) or below (−) the line of sight.
- **Clicks** are corrections to dial: `U`/`D` for elevation, `L`/`R` for windage.
- **Wind from** is degrees clockwise from the target: 90° is full value from the
  right, 270° from the left, 0° a headwind.
- **Pressure** is the weather-report (sea-level-corrected) reading by default, and
  altitude converts it to station pressure. Tick "Station pressure" for a Kestrel /
  absolute reading.
- The rifle is zeroed in still air under the current conditions.

## Validation status

`src/solver/__tests__/validation.test.ts` checks the solver against Hornady's
published tables (path ±0.3″, velocity ±15 fps). All pass.

| Load (200 yd zero, 1.5″ SH) | 100 yd | 200 yd | 300 yd | 300 yd velocity |
|---|---|---|---|---|
| 6.5 CM 143 ELD-X, G1 0.625: Hornady | +1.9 | 0 | −7.9 | 2285 |
| 6.5 CM: solver | +1.92 | 0.00 | −7.89 | 2278 |
| 30-30 160 FTX, G1 0.330: Hornady | +3.0 | 0 | −12.5 | 1700 |
| 30-30 FTX: solver | +3.04 | 0.00 | −12.63 | 1689 |

Hornady's own page lists −12.5″ at 300 yd for the 30-30 FTX. Some retailer
listings show −12.1″, which no G1 0.330 / 2400 fps solution reproduces.
