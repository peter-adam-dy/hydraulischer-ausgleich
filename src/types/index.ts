export type BuildingType = 'apartment' | 'detached' | 'semi_detached' | 'terraced';

export type BuildingAgeClass =
  | 'before_1978'
  | '1979_1983'
  | '1984_1994'
  | '1995_2001'
  | '2002_2009'
  | '2010_2015'
  | 'after_2016';

export type RoomUsageType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'hallway'
  | 'office'
  | 'storage'
  | 'wc';

export type FloorPosition = 'basement' | 'ground' | 'upper' | 'top';

export type ComponentType = 'exterior_wall' | 'interior_wall' | 'roof' | 'floor' | 'ceiling';

export type RadiatorType = '10' | '11' | '20' | '21' | '22' | '33';

export interface WindowComponent {
  id: string;
  area: number; // m²
  uValue: number; // W/(m²·K)
  dimWidth?: number; // m (optional, for width×height input mode)
  dimHeight?: number; // m
}

export interface BuildingComponent {
  id: string;
  name?: string; // e.g. "Nordwand", "Südwand Küche"
  type: ComponentType;
  area: number; // m² (gross area including windows)
  uValue: number; // W/(m²·K)
  adjacentTemp: number | null; // °C, null = outdoor
  windows: WindowComponent[];
  dimWidth?: number; // m (optional, for width×height input mode)
  dimHeight?: number; // m
}

export interface Project {
  id?: number;
  name: string;
  buildingType: BuildingType;
  buildingAgeClass: BuildingAgeClass;
  climateZoneId: string;
  designOutdoorTemp: number; // °C
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id?: number;
  projectId: number;
  name: string;
  usageType: RoomUsageType;
  length: number; // m
  width: number; // m
  height: number; // m
  floorPosition: FloorPosition;
  desiredTemp: number; // °C
  airChangeRate: number; // 1/h
  buildingComponents: BuildingComponent[];
}

export interface Radiator {
  id?: number;
  projectId: number;
  roomId: number;
  type: RadiatorType;
  height: number; // mm
  length: number; // mm
  ratedOutputDeltaT50: number; // W
  valveType?: string; // Override; undefined = use system default
  valveDn?: number; // Override DN size (10/15/20); undefined = use system default
}

export interface Circuit {
  id?: number;
  projectId: number;
  name: string;
}

export interface CircuitRadiator {
  id?: number;
  circuitId: number;
  radiatorId: number;
  estimatedPipeLength: number; // m (one-way distance to radiator)
  pipeLengthReturn?: number; // m (return pipe, if different from supply)
  sortOrder: number;
}

export interface SystemSettings {
  id?: number;
  projectId: number;
  supplyTemp: number; // °C (Vorlauf)
  returnTemp: number; // °C (Rücklauf)
  valveType: string;
  valveDn: number; // DN size (10/15/20), default 15
  specificPressureLoss: number; // Pa/m
}

export interface CalculationResult {
  id?: number;
  projectId: number;
  roomId: number;
  radiatorId?: number;
  heatingLoad: number; // W
  transmissionLoss: number; // W
  ventilationLoss: number; // W
  radiatorActualOutput?: number; // W
  flowRate?: number; // L/h
  pressureLoss?: number; // Pa
  kvValue?: number;
  valvePreset?: string;
  isStale: boolean;
  calculatedAt: Date;
}
