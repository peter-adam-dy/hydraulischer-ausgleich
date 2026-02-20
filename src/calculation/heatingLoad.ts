import type { Room, BuildingComponent } from '../types/index.ts';

export interface HeatingLoadResult {
  transmissionLoss: number; // W
  ventilationLoss: number; // W
  totalHeatingLoad: number; // W
}

/**
 * Calculate transmission heat loss for a single building component.
 * Net area = gross area - sum of window areas.
 * For each window: loss = U_window × A_window × ΔT
 * For net wall: loss = U_wall × A_net × ΔT
 */
export function calculateComponentTransmissionLoss(
  component: BuildingComponent,
  indoorTemp: number,
  outdoorTemp: number,
): number {
  const deltaT = component.adjacentTemp !== null
    ? indoorTemp - component.adjacentTemp
    : indoorTemp - outdoorTemp;

  if (deltaT <= 0) return 0;

  const windowArea = component.windows.reduce((sum, w) => sum + w.area, 0);
  const netArea = Math.max(0, component.area - windowArea);

  let loss = component.uValue * netArea * deltaT;

  for (const window of component.windows) {
    loss += window.uValue * window.area * deltaT;
  }

  return loss;
}

/**
 * Calculate total transmission heat loss for a room.
 * ΦT = Σ(U × A × ΔT) for each component
 */
export function calculateTransmissionLoss(
  room: Room,
  outdoorTemp: number,
): number {
  let total = 0;
  for (const component of room.buildingComponents) {
    total += calculateComponentTransmissionLoss(component, room.desiredTemp, outdoorTemp);
  }
  return Math.round(total);
}

/**
 * Calculate ventilation heat loss for a room.
 * ΦV = 0.34 × V × n × ΔT
 * where V = room volume (m³), n = air change rate (1/h)
 */
export function calculateVentilationLoss(
  room: Room,
  outdoorTemp: number,
): number {
  const volume = room.length * room.width * room.height;
  const deltaT = room.desiredTemp - outdoorTemp;
  if (deltaT <= 0) return 0;
  return Math.round(0.34 * volume * room.airChangeRate * deltaT);
}

/**
 * Calculate total heating load for a room.
 * ΦHL = ΦT + ΦV
 */
export function calculateHeatingLoad(
  room: Room,
  outdoorTemp: number,
): HeatingLoadResult {
  const transmissionLoss = calculateTransmissionLoss(room, outdoorTemp);
  const ventilationLoss = calculateVentilationLoss(room, outdoorTemp);
  return {
    transmissionLoss,
    ventilationLoss,
    totalHeatingLoad: transmissionLoss + ventilationLoss,
  };
}
