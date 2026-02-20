/**
 * Calculate volume flow rate for a radiator.
 * Q = Φ / (1.163 × (T_supply - T_return))
 * Returns flow rate in L/h
 */
export function calculateFlowRate(
  heatingPower: number, // W
  supplyTemp: number, // °C
  returnTemp: number, // °C
): number {
  const spread = supplyTemp - returnTemp;
  if (spread <= 0) return 0;
  return heatingPower / (1.163 * spread);
}
