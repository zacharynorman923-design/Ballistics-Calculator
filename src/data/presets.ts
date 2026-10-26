// Built-in rifle/load presets. BCs marked `bcFromBox` are the manufacturer's
// published values — check them against your box and edit as needed.

import type { DragModel } from '../solver';

export interface LoadProfile {
  id: string;
  name: string;
  cartridge: string;
  bullet: string;
  muzzleVelocity: number; // fps
  bc: number;
  dragModel: DragModel;
  bulletWeight: number; // gr
  sightHeight: number; // in
  zeroRange: number; // yd
  /** True when the BC should be confirmed from the ammo box. */
  bcFromBox?: boolean;
  notes?: string;
}

export const PRESETS: readonly LoadProfile[] = [
  {
    id: 'preset-65cm-143-eldx',
    name: '6.5 CM 143 ELD-X',
    cartridge: '6.5 Creedmoor',
    bullet: 'Hornady 143 gr ELD-X Precision Hunter',
    muzzleVelocity: 2700,
    bc: 0.625,
    dragModel: 'G1',
    bulletWeight: 143,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Hornady box: G1 0.625 / G7 0.315.',
  },
  {
    id: 'preset-3030-150-pp',
    name: '30-30 150 Power-Point',
    cartridge: '30-30 Win',
    bullet: 'Winchester 150 gr Power-Point',
    muzzleVelocity: 2390,
    bc: 0.218,
    dragModel: 'G1',
    bulletWeight: 150,
    sightHeight: 1.5,
    zeroRange: 150,
  },
  {
    id: 'preset-3030-160-ftx',
    name: '30-30 160 FTX',
    cartridge: '30-30 Win',
    bullet: 'Hornady 160 gr FTX LEVERevolution',
    muzzleVelocity: 2400,
    bc: 0.33,
    dragModel: 'G1',
    bulletWeight: 160,
    sightHeight: 1.5,
    zeroRange: 200,
  },
  {
    id: 'preset-3006-150-pp',
    name: '30-06 150 Power-Point',
    cartridge: '30-06 Springfield',
    bullet: 'Winchester 150 gr Power-Point',
    muzzleVelocity: 2920,
    bc: 0.294,
    dragModel: 'G1',
    bulletWeight: 150,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Winchester published G1 0.294.',
  },
];

export function presetById(id: string): LoadProfile {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown preset ${id}`);
  return p;
}
