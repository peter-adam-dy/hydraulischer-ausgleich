/**
 * Calculate actual radiator output at design system temperatures.
 * Φ_actual = Φ_rated × (ΔT_actual / 50)^n
 * where n ≈ 1.3 for panel radiators
 * ΔT_actual = (T_supply + T_return) / 2 - T_room
 */
export function calculateActualOutput(
  ratedOutputDeltaT50: number,
  supplyTemp: number,
  returnTemp: number,
  roomTemp: number,
  exponent: number = 1.3,
): number {
  const deltaT_actual = (supplyTemp + returnTemp) / 2 - roomTemp;
  if (deltaT_actual <= 0) return 0;
  return Math.round(ratedOutputDeltaT50 * Math.pow(deltaT_actual / 50, exponent));
}
