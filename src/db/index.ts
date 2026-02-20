import Dexie, { type EntityTable } from 'dexie';
import type {
  Project,
  Room,
  Radiator,
  Circuit,
  CircuitRadiator,
  SystemSettings,
  CalculationResult,
} from '../types/index.ts';

class HydraulicDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  rooms!: EntityTable<Room, 'id'>;
  radiators!: EntityTable<Radiator, 'id'>;
  circuits!: EntityTable<Circuit, 'id'>;
  circuitRadiators!: EntityTable<CircuitRadiator, 'id'>;
  systemSettings!: EntityTable<SystemSettings, 'id'>;
  calculationResults!: EntityTable<CalculationResult, 'id'>;

  constructor() {
    super('hydraulischer-ausgleich');

    this.version(1).stores({
      projects: '++id, name',
      rooms: '++id, projectId',
      radiators: '++id, projectId, roomId',
      circuits: '++id, projectId',
      circuitRadiators: '++id, circuitId, radiatorId',
      systemSettings: '++id, projectId',
      calculationResults: '++id, projectId, roomId, radiatorId',
    });
  }
}

export const db = new HydraulicDatabase();
