import type { RoomUsageType } from '../../types/index.ts';

export interface AirChangeRateEntry {
  usageType: RoomUsageType;
  rate: number; // 1/h
  label: string;
}

export const airChangeRates: AirChangeRateEntry[] = [
  { usageType: 'living_room', rate: 0.5, label: 'Wohnzimmer' },
  { usageType: 'bedroom', rate: 0.5, label: 'Schlafzimmer' },
  { usageType: 'kitchen', rate: 1.0, label: 'Küche' },
  { usageType: 'bathroom', rate: 1.5, label: 'Badezimmer' },
  { usageType: 'hallway', rate: 0.5, label: 'Flur' },
  { usageType: 'office', rate: 0.5, label: 'Arbeitszimmer' },
  { usageType: 'storage', rate: 0.3, label: 'Abstellraum' },
  { usageType: 'wc', rate: 1.0, label: 'WC' },
];

export function getDefaultAirChangeRate(usageType: RoomUsageType): number {
  const entry = airChangeRates.find((e) => e.usageType === usageType);
  return entry?.rate ?? 0.5;
}
