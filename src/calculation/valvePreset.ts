import { lookupValvePreset, type ValvePreset } from '../data/reference/valveKvTables.ts';

/**
 * Calculate required Kv value.
 * Kv = (Q/1000) / √(ΔP/100)
 * where Q is in L/h and ΔP is in kPa (we convert from Pa)
 * Returns Kv in m³/h
 */
export function calculateKv(
  flowRate: number, // L/h
  pressureLoss: number, // Pa
): number {
  if (pressureLoss <= 0) return 0;
  const pressureLossBar = pressureLoss / 100000; // Pa to bar
  return (flowRate / 1000) / Math.sqrt(pressureLossBar);
}

/**
 * Find the valve preset for a given required Kv value.
 */
export function findValvePreset(
  valveTypeId: string,
  dn: number,
  requiredKv: number,
): ValvePreset | undefined {
  return lookupValvePreset(valveTypeId, dn, requiredKv);
}
