import type { RadiatorType } from '../../types/index.ts';

// Rated output in W/m at ΔT50 by radiator type and height (mm)
// Source: typical EN 442 values from major manufacturers
const radiatorOutputTable: Record<RadiatorType, Record<number, number>> = {
  '10': {
    300: 263,
    400: 351,
    500: 439,
    600: 527,
    700: 614,
    900: 790,
  },
  '11': {
    300: 422,
    400: 563,
    500: 703,
    600: 844,
    700: 985,
    900: 1266,
  },
  '20': {
    300: 416,
    400: 555,
    500: 694,
    600: 832,
    700: 971,
    900: 1248,
  },
  '21': {
    300: 565,
    400: 753,
    500: 941,
    600: 1129,
    700: 1318,
    900: 1694,
  },
  '22': {
    300: 702,
    400: 936,
    500: 1170,
    600: 1404,
    700: 1638,
    900: 2106,
  },
  '33': {
    300: 981,
    400: 1308,
    500: 1635,
    600: 1962,
    700: 2289,
    900: 2943,
  },
};

export const availableHeights = [300, 400, 500, 600, 700, 900];

export function getRadiatorOutputPerMeter(type: RadiatorType, height: number): number | undefined {
  return radiatorOutputTable[type]?.[height];
}

export function calculateRatedOutput(type: RadiatorType, height: number, length: number): number | undefined {
  const outputPerMeter = getRadiatorOutputPerMeter(type, height);
  if (outputPerMeter === undefined) return undefined;
  return Math.round(outputPerMeter * (length / 1000));
}

export function getRadiatorTypeName(type: RadiatorType): string {
  const names: Record<RadiatorType, string> = {
    '10': 'Typ 10 (1 Platte, 0 Konvektoren)',
    '11': 'Typ 11 (1 Platte, 1 Konvektor)',
    '20': 'Typ 20 (2 Platten, 0 Konvektoren)',
    '21': 'Typ 21 (2 Platten, 1 Konvektor)',
    '22': 'Typ 22 (2 Platten, 2 Konvektoren)',
    '33': 'Typ 33 (3 Platten, 3 Konvektoren)',
  };
  return names[type];
}
