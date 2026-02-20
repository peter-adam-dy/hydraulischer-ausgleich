import { db } from '../db/index.ts';

export interface ExportData {
  version: 1;
  exportedAt: string;
  projects: unknown[];
  rooms: unknown[];
  radiators: unknown[];
  circuits: unknown[];
  circuitRadiators: unknown[];
  systemSettings: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
  const [projects, rooms, radiators, circuits, circuitRadiators, systemSettings] =
    await Promise.all([
      db.projects.toArray(),
      db.rooms.toArray(),
      db.radiators.toArray(),
      db.circuits.toArray(),
      db.circuitRadiators.toArray(),
      db.systemSettings.toArray(),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    rooms,
    radiators,
    circuits,
    circuitRadiators,
    systemSettings,
  };
}

export function downloadJson(data: ExportData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hydraulischer-abgleich-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const data: ExportData = JSON.parse(text);

  if (data.version !== 1) {
    throw new Error('Unsupported export version');
  }

  await db.transaction(
    'rw',
    [db.projects, db.rooms, db.radiators, db.circuits, db.circuitRadiators, db.systemSettings, db.calculationResults],
    async () => {
      // Clear all existing data
      await db.calculationResults.clear();
      await db.circuitRadiators.clear();
      await db.circuits.clear();
      await db.systemSettings.clear();
      await db.radiators.clear();
      await db.rooms.clear();
      await db.projects.clear();

      // Import new data
      if (data.projects.length) await db.projects.bulkAdd(data.projects as never[]);
      if (data.rooms.length) await db.rooms.bulkAdd(data.rooms as never[]);
      if (data.radiators.length) await db.radiators.bulkAdd(data.radiators as never[]);
      if (data.circuits.length) await db.circuits.bulkAdd(data.circuits as never[]);
      if (data.circuitRadiators.length) await db.circuitRadiators.bulkAdd(data.circuitRadiators as never[]);
      if (data.systemSettings.length) await db.systemSettings.bulkAdd(data.systemSettings as never[]);
    },
  );
}
