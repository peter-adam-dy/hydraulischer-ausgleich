import { describe, it, expect } from 'vitest';
import { calculateActualOutput } from '../radiatorOutput.ts';

describe('radiatorOutput', () => {
  it('returns rated output at ΔT50', () => {
    // When system temps give exactly ΔT50: (90+30)/2 - 10 = 50
    const output = calculateActualOutput(1000, 90, 30, 10);
    expect(output).toBe(1000);
  });

  it('reduces output at lower ΔT', () => {
    // ΔT = (70+55)/2 - 20 = 42.5
    // factor = (42.5/50)^1.3 ≈ 0.819
    const output = calculateActualOutput(1000, 70, 55, 20);
    expect(output).toBeGreaterThan(750);
    expect(output).toBeLessThan(850);
  });

  it('returns 0 when ΔT is zero or negative', () => {
    expect(calculateActualOutput(1000, 20, 15, 20)).toBe(0);
  });
});
