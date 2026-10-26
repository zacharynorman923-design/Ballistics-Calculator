// Shared solver types. All public quantities are imperial:
// yards (range), inches (path / sight height), fps, grains, ft-lbs,
// °F, feet (altitude), inHg (pressure), mph (wind), seconds.

export type DragModel = 'G1' | 'G7';

export type AngleUnit = 'MOA' | 'MIL';

export interface Environment {
  temperatureF: number;
  altitudeFt: number;
  /** Barometric pressure in inHg. */
  pressureInHg: number;
  /**
   * false (default): pressure is the sea-level-corrected barometer reading
   * a weather report gives; station pressure is derived from altitude.
   * true: pressure is the absolute station pressure (e.g. from a Kestrel),
   * and altitude is not used for density.
   */
  pressureIsStation: boolean;
  windSpeedMph: number;
  /**
   * Direction the wind blows FROM, clockwise from the line of fire:
   * 0 = headwind, 90 = full value from the right (3 o'clock),
   * 180 = tailwind, 270 = full value from the left.
   */
  windAngleDeg: number;
}

export interface ShotInput {
  muzzleVelocity: number; // fps
  bc: number; // lb/in², referenced to dragModel
  dragModel: DragModel;
  bulletWeight: number; // grains
  sightHeight: number; // inches, bore center to scope center
  zeroRange: number; // yards
  env: Environment;
}

export interface ClickSettings {
  unit: AngleUnit;
  /** Angular value of one click in `unit` (0.25 MOA, 0.1 MIL). */
  value: number;
}

export interface TrajectoryRow {
  range: number; // yd
  path: number; // in, relative to line of sight (+ above)
  pathMoa: number; // angular path; negative = below LOS
  pathMil: number;
  /** Elevation clicks to dial: + = up. */
  elevationClicks: number;
  velocity: number; // fps
  energy: number; // ft-lbs
  time: number; // s
  windage: number; // in, + = right of LOS
  windageMoa: number;
  windageMil: number;
  /** Windage clicks to dial: + = right. */
  windageClicks: number;
}

export interface Trajectory {
  /** Bore elevation angle relative to the line of sight, radians. */
  boreAngle: number;
  rows: TrajectoryRow[];
}
