/**
 * Calculate simplified pressure loss in pipe system.
 * ΔP = specificPressureLoss × pipeLength × 1.3
 * The 1.3 factor accounts for ~30% surcharge for fittings.
 * Returns pressure loss in Pa
 */
export function calculatePressureLoss(
  specificPressureLoss: number, // Pa/m
  pipeLength: number, // m (supply + return total)
  fittingsFactor: number = 1.3,
): number {
  return specificPressureLoss * pipeLength * fittingsFactor;
}
