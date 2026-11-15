import { describe, expect, it } from 'vitest';
import { barrelSettings, defaultFpsPerInch, effectiveVelocity, typicalBarrelIn } from '../barrel';
import { presetById } from '../presets';

describe('barrel length adjustment', () => {
  const eldx = presetById('preset-65cm-143-eldx');

  it('is off by default and leaves the box velocity alone', () => {
    expect(effectiveVelocity(eldx)).toBe(2700);
    expect(effectiveVelocity(eldx, { enabled: false, barrelIn: 18 })).toBe(2700);
  });

  it('subtracts fps per inch below the test barrel, adds above it', () => {
    expect(effectiveVelocity(eldx, { enabled: true, barrelIn: 20 })).toBe(2700 - 4 * 25);
    expect(effectiveVelocity(eldx, { enabled: true, barrelIn: 26 })).toBe(2700 + 2 * 25);
    expect(effectiveVelocity({ ...eldx, fpsPerInch: 30 }, { enabled: true, barrelIn: 22 })).toBe(2640);
  });

  it('uses the preset test barrel (16" for 300 BLK) and cartridge defaults', () => {
    const blk = presetById('preset-300blk-110-tactx');
    expect(barrelSettings(blk).testBarrelIn).toBe(16);
    expect(effectiveVelocity(blk, { enabled: true, barrelIn: 10.5 })).toBe(2350 - 5.5 * 25);
    expect(defaultFpsPerInch('7mm Rem Mag', 3110)).toBe(30);
    expect(defaultFpsPerInch('30-30 Win', 2400)).toBe(20);
    expect(defaultFpsPerInch('300 Blackout', 1050)).toBe(5);
  });

  it('starts "My barrel" at a typical length for the cartridge', () => {
    expect(barrelSettings(eldx).barrelIn).toBe(22);
    expect(barrelSettings(presetById('preset-3030-160-ftx')).barrelIn).toBe(20);
    expect(barrelSettings(presetById('preset-223-55-umc-fmj')).barrelIn).toBe(16);
    expect(typicalBarrelIn('6.5 creedmoor')).toBe(22);
    expect(typicalBarrelIn('Wildcat 9000')).toBeNull();
    expect(barrelSettings({ ...eldx, cartridge: 'Wildcat 9000' }).barrelIn).toBe(24);
    // Enabling with the typical length: 6.5 CM from 22" is 50 fps slower.
    expect(effectiveVelocity(eldx, { enabled: true, barrelIn: barrelSettings(eldx).barrelIn })).toBe(2650);
  });
});
