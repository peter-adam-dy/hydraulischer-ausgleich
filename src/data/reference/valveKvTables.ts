export interface ValveType {
  id: string;
  name: string;
  manufacturer: string;
  sizes: ValveSize[];
}

export interface ValveSize {
  dn: number; // DN10, DN15, DN20
  presets: ValvePreset[];
}

export interface ValvePreset {
  setting: string; // e.g. "1", "2", "N", etc.
  kv: number; // m³/h
}

export const valveTypes: ValveType[] = [
  {
    id: 'danfoss_ra_n',
    name: 'RA-N',
    manufacturer: 'Danfoss',
    sizes: [
      {
        dn: 10,
        presets: [
          { setting: '1', kv: 0.04 },
          { setting: '2', kv: 0.10 },
          { setting: '3', kv: 0.18 },
          { setting: '4', kv: 0.31 },
          { setting: '5', kv: 0.50 },
          { setting: '6', kv: 0.73 },
          { setting: '7', kv: 0.90 },
          { setting: 'N', kv: 1.00 },
        ],
      },
      {
        dn: 15,
        presets: [
          { setting: '1', kv: 0.04 },
          { setting: '2', kv: 0.10 },
          { setting: '3', kv: 0.20 },
          { setting: '4', kv: 0.35 },
          { setting: '5', kv: 0.56 },
          { setting: '6', kv: 0.80 },
          { setting: '7', kv: 1.05 },
          { setting: 'N', kv: 1.30 },
        ],
      },
      {
        dn: 20,
        presets: [
          { setting: '1', kv: 0.10 },
          { setting: '2', kv: 0.23 },
          { setting: '3', kv: 0.42 },
          { setting: '4', kv: 0.65 },
          { setting: '5', kv: 1.05 },
          { setting: '6', kv: 1.50 },
          { setting: '7', kv: 2.10 },
          { setting: 'N', kv: 2.60 },
        ],
      },
    ],
  },
  {
    id: 'heimeier_v_exact',
    name: 'V-exact II',
    manufacturer: 'Heimeier',
    sizes: [
      {
        dn: 10,
        presets: [
          { setting: '1', kv: 0.03 },
          { setting: '2', kv: 0.09 },
          { setting: '3', kv: 0.16 },
          { setting: '4', kv: 0.27 },
          { setting: '5', kv: 0.42 },
          { setting: '6', kv: 0.62 },
          { setting: '7', kv: 0.86 },
        ],
      },
      {
        dn: 15,
        presets: [
          { setting: '1', kv: 0.04 },
          { setting: '2', kv: 0.10 },
          { setting: '3', kv: 0.20 },
          { setting: '4', kv: 0.34 },
          { setting: '5', kv: 0.54 },
          { setting: '6', kv: 0.80 },
          { setting: '7', kv: 1.14 },
        ],
      },
      {
        dn: 20,
        presets: [
          { setting: '1', kv: 0.10 },
          { setting: '2', kv: 0.24 },
          { setting: '3', kv: 0.44 },
          { setting: '4', kv: 0.72 },
          { setting: '5', kv: 1.10 },
          { setting: '6', kv: 1.58 },
          { setting: '7', kv: 2.20 },
        ],
      },
    ],
  },
  {
    id: 'oventrop_av6',
    name: 'AV-6',
    manufacturer: 'Oventrop',
    sizes: [
      {
        dn: 10,
        presets: [
          { setting: '1', kv: 0.04 },
          { setting: '2', kv: 0.10 },
          { setting: '3', kv: 0.19 },
          { setting: '4', kv: 0.32 },
          { setting: '5', kv: 0.52 },
          { setting: '6', kv: 0.75 },
        ],
      },
      {
        dn: 15,
        presets: [
          { setting: '1', kv: 0.06 },
          { setting: '2', kv: 0.14 },
          { setting: '3', kv: 0.27 },
          { setting: '4', kv: 0.45 },
          { setting: '5', kv: 0.72 },
          { setting: '6', kv: 1.05 },
        ],
      },
      {
        dn: 20,
        presets: [
          { setting: '1', kv: 0.10 },
          { setting: '2', kv: 0.25 },
          { setting: '3', kv: 0.48 },
          { setting: '4', kv: 0.80 },
          { setting: '5', kv: 1.20 },
          { setting: '6', kv: 1.80 },
        ],
      },
    ],
  },
];

export function findValveType(id: string): ValveType | undefined {
  return valveTypes.find((v) => v.id === id);
}

export function lookupValvePreset(
  valveTypeId: string,
  dn: number,
  requiredKv: number
): ValvePreset | undefined {
  const valve = findValveType(valveTypeId);
  if (!valve) return undefined;

  const size = valve.sizes.find((s) => s.dn === dn);
  if (!size) return undefined;

  // Find the smallest preset with kv >= requiredKv
  return size.presets.find((p) => p.kv >= requiredKv);
}
