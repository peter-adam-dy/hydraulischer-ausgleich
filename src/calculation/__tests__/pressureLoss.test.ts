import { describe, it, expect } from 'vitest';
import { calculatePressureLoss } from '../pressureLoss.ts';

describe('pressureLoss', () => {
  it('calculates pressure loss with fittings factor', () => {
    // 120 Pa/m × 10m × 1.3 = 1560 Pa
    expect(calculatePressureLoss(120, 10)).toBe(1560);
  });

  it('uses custom fittings factor', () => {
    expect(calculatePressureLoss(120, 10, 1.5)).toBe(1800);
  });
});
