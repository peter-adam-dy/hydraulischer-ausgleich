import type { BuildingAgeClass, ComponentType } from '../../types/index.ts';

export interface UValueEntry {
  componentType: ComponentType | 'window';
  uValue: number; // W/(m²·K)
}

export const uValueTable: Record<BuildingAgeClass, UValueEntry[]> = {
  before_1978: [
    { componentType: 'exterior_wall', uValue: 1.4 },
    { componentType: 'roof', uValue: 0.9 },
    { componentType: 'floor', uValue: 1.0 },
    { componentType: 'window', uValue: 2.8 },
    { componentType: 'interior_wall', uValue: 1.2 },
    { componentType: 'ceiling', uValue: 1.0 },
  ],
  '1979_1983': [
    { componentType: 'exterior_wall', uValue: 0.8 },
    { componentType: 'roof', uValue: 0.5 },
    { componentType: 'floor', uValue: 0.7 },
    { componentType: 'window', uValue: 2.7 },
    { componentType: 'interior_wall', uValue: 1.0 },
    { componentType: 'ceiling', uValue: 0.7 },
  ],
  '1984_1994': [
    { componentType: 'exterior_wall', uValue: 0.6 },
    { componentType: 'roof', uValue: 0.4 },
    { componentType: 'floor', uValue: 0.5 },
    { componentType: 'window', uValue: 1.8 },
    { componentType: 'interior_wall', uValue: 0.8 },
    { componentType: 'ceiling', uValue: 0.5 },
  ],
  '1995_2001': [
    { componentType: 'exterior_wall', uValue: 0.4 },
    { componentType: 'roof', uValue: 0.3 },
    { componentType: 'floor', uValue: 0.4 },
    { componentType: 'window', uValue: 1.5 },
    { componentType: 'interior_wall', uValue: 0.6 },
    { componentType: 'ceiling', uValue: 0.4 },
  ],
  '2002_2009': [
    { componentType: 'exterior_wall', uValue: 0.3 },
    { componentType: 'roof', uValue: 0.25 },
    { componentType: 'floor', uValue: 0.35 },
    { componentType: 'window', uValue: 1.3 },
    { componentType: 'interior_wall', uValue: 0.5 },
    { componentType: 'ceiling', uValue: 0.35 },
  ],
  '2010_2015': [
    { componentType: 'exterior_wall', uValue: 0.24 },
    { componentType: 'roof', uValue: 0.2 },
    { componentType: 'floor', uValue: 0.3 },
    { componentType: 'window', uValue: 1.1 },
    { componentType: 'interior_wall', uValue: 0.4 },
    { componentType: 'ceiling', uValue: 0.3 },
  ],
  after_2016: [
    { componentType: 'exterior_wall', uValue: 0.2 },
    { componentType: 'roof', uValue: 0.15 },
    { componentType: 'floor', uValue: 0.25 },
    { componentType: 'window', uValue: 0.95 },
    { componentType: 'interior_wall', uValue: 0.35 },
    { componentType: 'ceiling', uValue: 0.25 },
  ],
};

export function getDefaultUValue(
  ageClass: BuildingAgeClass,
  componentType: ComponentType | 'window'
): number {
  const entry = uValueTable[ageClass].find((e) => e.componentType === componentType);
  return entry?.uValue ?? 1.0;
}
