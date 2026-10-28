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
    id: 'preset-65cm-140-bcmax',
    name: '6.5 CM 140 BC Max',
    cartridge: '6.5 Creedmoor',
    bullet: 'Winchester Supreme Long Range 140 gr BC Max (S65BC)',
    muzzleVelocity: 2725,
    bc: 0.617,
    dragModel: 'G1',
    bulletWeight: 140,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Winchester published BC 0.617 (treated as G1; Winchester doesn’t say).',
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
  {
    id: 'preset-223-55-umc-fmj',
    name: '.223 55 UMC FMJ',
    cartridge: '.223 Remington',
    bullet: 'Remington UMC 55 gr Full Metal Jacket (L223R3)',
    muzzleVelocity: 3240,
    bc: 0.202,
    dragModel: 'G1',
    bulletWeight: 55,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.202. AR-15s usually have about 2.6″ sight height.',
  },
  {
    id: 'preset-223-55-corelokt',
    name: '.223 55 Core-Lokt PSP',
    cartridge: '.223 Remington',
    bullet: 'Remington 55 gr Core-Lokt Pointed Soft Point (R223R1)',
    muzzleVelocity: 3240,
    bc: 0.197,
    dragModel: 'G1',
    bulletWeight: 55,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.197. AR-15s usually have about 2.6″ sight height.',
  },
  {
    id: 'preset-7rm-162-eldx',
    name: '7mm RM 162 ELD-X',
    cartridge: '7mm Rem Mag',
    bullet: 'Hornady 162 gr ELD-X Precision Hunter (80636)',
    muzzleVelocity: 2940,
    bc: 0.631,
    dragModel: 'G1',
    bulletWeight: 162,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Hornady box: G1 0.631 / G7 0.318.',
  },
  {
    id: 'preset-7rm-150-corelokt',
    name: '7mm RM 150 Core-Lokt PSP',
    cartridge: '7mm Rem Mag',
    bullet: 'Remington 150 gr Core-Lokt Pointed Soft Point (R7MM2)',
    muzzleVelocity: 3110,
    bc: 0.346,
    dragModel: 'G1',
    bulletWeight: 150,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Remington published G1 0.346.',
  },
  {
    id: 'preset-7rm-150-powerpoint',
    name: '7mm RM 150 Power-Point',
    cartridge: '7mm Rem Mag',
    bullet: 'Winchester Super-X 150 gr Power-Point (X7MMR1)',
    muzzleVelocity: 3090,
    bc: 0.373,
    dragModel: 'G1',
    bulletWeight: 150,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.373.',
  },
  {
    id: 'preset-7rm-150-powershok',
    name: '7mm RM 150 Power-Shok SP',
    cartridge: '7mm Rem Mag',
    bullet: 'Federal Power-Shok 150 gr Soft Point (7RA)',
    muzzleVelocity: 3110,
    bc: 0.408,
    dragModel: 'G1',
    bulletWeight: 150,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Federal published G1 0.408.',
  },
  {
    id: 'preset-270-145-eldx',
    name: '270 145 ELD-X',
    cartridge: '270 Win',
    bullet: 'Hornady 145 gr ELD-X Precision Hunter (80536)',
    muzzleVelocity: 2970,
    bc: 0.536,
    dragModel: 'G1',
    bulletWeight: 145,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Hornady box: G1 0.536 / G7 0.270.',
  },
  {
    id: 'preset-270-130-corelokt',
    name: '270 130 Core-Lokt PSP',
    cartridge: '270 Win',
    bullet: 'Remington 130 gr Core-Lokt Pointed Soft Point (R270W2)',
    muzzleVelocity: 3060,
    bc: 0.336,
    dragModel: 'G1',
    bulletWeight: 130,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.336.',
  },
  {
    id: 'preset-270-130-powerpoint',
    name: '270 130 Power-Point',
    cartridge: '270 Win',
    bullet: 'Winchester Super-X 130 gr Power-Point (X2705)',
    muzzleVelocity: 3060,
    bc: 0.372,
    dragModel: 'G1',
    bulletWeight: 130,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.372.',
  },
  {
    id: 'preset-270-130-powershok',
    name: '270 130 Power-Shok SP',
    cartridge: '270 Win',
    bullet: 'Federal Power-Shok 130 gr Soft Point (270A)',
    muzzleVelocity: 3060,
    bc: 0.372,
    dragModel: 'G1',
    bulletWeight: 130,
    sightHeight: 1.5,
    zeroRange: 200,
    bcFromBox: true,
    notes: 'Retailer-listed G1 0.372.',
  },
];

/** Normalized cartridge name for same-caliber matching ("30-30 Win" ≈ "30-30 Winchester"). */
export function cartridgeKey(cartridge: string): string {
  return cartridge
    .toLowerCase()
    .replace(/remington/g, 'rem')
    .replace(/winchester/g, 'win')
    .replace(/springfield/g, 'sprg')
    .replace(/[^a-z0-9]/g, '');
}

export function presetById(id: string): LoadProfile {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown preset ${id}`);
  return p;
}
