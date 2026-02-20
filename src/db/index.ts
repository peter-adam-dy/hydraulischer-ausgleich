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

    // v2: Radiator gains optional valveType/valveDn fields,
    //     SystemSettings gains valveDn,
    //     BuildingComponent/WindowComponent gain dimWidth/dimHeight (nested JSON, no index change).
    //     Stores unchanged — Dexie only needs .stores() for index changes.
    this.version(2).stores({}).upgrade((tx) => {
      return tx.table('systemSettings').toCollection().modify((settings) => {
        if (settings.valveDn === undefined) {
          settings.valveDn = 15;
        }
      });
    });
  }
}

export const db = new HydraulicDatabase();
