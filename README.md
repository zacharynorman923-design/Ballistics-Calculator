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
published paths (±0.3").

- **6.5 CM 143 ELD-X: passes.** +1.92 / 0.00 / −7.89″ against +1.9 / 0 / −7.9.
- **30-30 160 FTX: fails at 300 yd.** +3.04 / 0.00 / **−12.63″** against
  +3.0 / 0 / −12.1. The solver is converged and its physics tests pass (see
  `solver.test.ts`). Its velocities with G1 0.330 land within ~10 fps of the
  figures recalled for Hornady's chart (2150 / 1916 / 1699; still to be
  checked against Hornady's page). Reaching −12.1″ would need a G1 BC of
  ~0.37 or ~2450 fps, so the published path and velocities can't both come
  from G1 0.330 at 2400 fps. See the commit message for details.
