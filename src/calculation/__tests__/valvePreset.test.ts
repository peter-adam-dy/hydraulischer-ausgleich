import { describe, it, expect } from 'vitest';
import { calculateKv, findValvePreset } from '../valvePreset.ts';

describe('valvePreset', () => {
  describe('calculateKv', () => {
    it('calculates Kv value correctly', () => {
      // Kv = (57.32/1000) / √(1560/100000)
      // = 0.05732 / √0.0156
      // = 0.05732 / 0.1249
      // ≈ 0.459
      const kv = calculateKv(57.32, 1560);
      expect(kv).toBeCloseTo(0.459, 2);
    });

    it('returns 0 when pressure loss is 0', () => {
      expect(calculateKv(100, 0)).toBe(0);
    });
  });

  describe('findValvePreset', () => {
    it('finds correct Danfoss RA-N DN15 preset', () => {
      // Kv 0.30 → next higher is setting 5 (kv 0.36)
      const preset = findValvePreset('danfoss_ra_n', 15, 0.30);
      expect(preset).toBeDefined();
      expect(preset!.setting).toBe('5');
      expect(preset!.kv).toBe(0.36);
    });

    it('returns undefined for unknown valve type', () => {
      expect(findValvePreset('unknown', 15, 0.5)).toBeUndefined();
    });
  });
});
