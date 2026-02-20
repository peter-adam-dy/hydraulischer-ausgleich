import type { RoomUsageType } from '../../types/index.ts';

export interface RoomTemperatureEntry {
  usageType: RoomUsageType;
  temp: number; // °C
  label: string;
}

export const roomTemperatures: RoomTemperatureEntry[] = [
  { usageType: 'living_room', temp: 20, label: 'Wohnzimmer' },
  { usageType: 'bedroom', temp: 18, label: 'Schlafzimmer' },
  { usageType: 'kitchen', temp: 20, label: 'Küche' },
  { usageType: 'bathroom', temp: 24, label: 'Badezimmer' },
  { usageType: 'hallway', temp: 18, label: 'Flur' },
  { usageType: 'office', temp: 20, label: 'Arbeitszimmer' },
  { usageType: 'storage', temp: 15, label: 'Abstellraum' },
  { usageType: 'wc', temp: 20, label: 'WC' },
];

export function getDefaultRoomTemperature(usageType: RoomUsageType): number {
  const entry = roomTemperatures.find((e) => e.usageType === usageType);
  return entry?.temp ?? 20;
}
