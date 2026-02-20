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

const STORES = {
  projects: '++id, name',
  rooms: '++id, projectId',
  radiators: '++id, projectId, roomId',
  circuits: '++id, projectId',
  circuitRadiators: '++id, circuitId, radiatorId',
  systemSettings: '++id, projectId',
  calculationResults: '++id, projectId, roomId, radiatorId',
};

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

    this.version(1).stores(STORES);

    // v2: Radiator gains optional valveType/valveDn,
    //     SystemSettings gains valveDn,
    //     BuildingComponent/WindowComponent gain name/dimWidth/dimHeight (nested JSON).
    //     No index changes — just a data migration for valveDn default.
    this.version(2).stores(STORES).upgrade((tx) => {
      return tx.table('systemSettings').toCollection().modify((settings) => {
        if (settings.valveDn === undefined) {
          settings.valveDn = 15;
        }
      });
    });

    // v3: Force re-apply stores to fix broken v2 migration that used empty stores({}).
    this.version(3).stores(STORES);
  }
}

export const db = new HydraulicDatabase();
