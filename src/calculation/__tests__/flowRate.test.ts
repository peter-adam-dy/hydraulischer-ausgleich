import { describe, it, expect } from 'vitest';
import { calculateFlowRate } from '../flowRate.ts';

describe('flowRate', () => {
  it('calculates flow rate correctly', () => {
    // Q = 1000 / (1.163 × 15) = 1000 / 17.445 ≈ 57.32
    const rate = calculateFlowRate(1000, 70, 55);
    expect(rate).toBeCloseTo(57.32, 1);
  });

  it('returns 0 when spread is zero', () => {
    expect(calculateFlowRate(1000, 55, 55)).toBe(0);
  });
});
