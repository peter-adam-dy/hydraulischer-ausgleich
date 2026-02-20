import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './index.ts';
import type { Project, Room, Radiator, Circuit, CircuitRadiator, SystemSettings } from '../types/index.ts';

export function useProjects() {
  return useLiveQuery(() => db.projects.toArray()) ?? [];
}

export function useProject(id: number | undefined) {
  return useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id]);
}

export function useRooms(projectId: number | undefined) {
  return useLiveQuery(
    () => (projectId ? db.rooms.where('projectId').equals(projectId).toArray() : []),
    [projectId]
  ) ?? [];
}

export function useRoom(id: number | undefined) {
  return useLiveQuery(() => (id ? db.rooms.get(id) : undefined), [id]);
}

export function useRadiators(projectId: number | undefined) {
  return useLiveQuery(
    () => (projectId ? db.radiators.where('projectId').equals(projectId).toArray() : []),
    [projectId]
  ) ?? [];
}

export function useRadiatorsByRoom(roomId: number | undefined) {
  return useLiveQuery(
    () => (roomId ? db.radiators.where('roomId').equals(roomId).toArray() : []),
    [roomId]
  ) ?? [];
}

export function useCircuits(projectId: number | undefined) {
  return useLiveQuery(
    () => (projectId ? db.circuits.where('projectId').equals(projectId).toArray() : []),
    [projectId]
  ) ?? [];
}

export function useCircuitRadiators(circuitId: number | undefined) {
  return useLiveQuery(
    () => (circuitId ? db.circuitRadiators.where('circuitId').equals(circuitId).toArray() : []),
    [circuitId]
  ) ?? [];
}

export function useSystemSettings(projectId: number | undefined) {
  return useLiveQuery(
    () => (projectId ? db.systemSettings.where('projectId').equals(projectId).first() : undefined),
    [projectId]
  );
}

export function useCalculationResults(projectId: number | undefined) {
  return useLiveQuery(
    () => (projectId ? db.calculationResults.where('projectId').equals(projectId).toArray() : []),
    [projectId]
  ) ?? [];
}

// Mutation helpers

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const id = await db.projects.add({ ...data, createdAt: now, updatedAt: now } as Project);
  // Create default system settings
  await db.systemSettings.add({
    projectId: id,
    supplyTemp: 70,
    returnTemp: 55,
    valveType: 'danfoss_ra_n',
    valveDn: 15,
    specificPressureLoss: 120,
  } as SystemSettings);
  return id;
}

export async function updateProject(id: number, data: Partial<Project>) {
  await db.projects.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteProject(id: number) {
  await db.transaction('rw', [db.projects, db.rooms, db.radiators, db.circuits, db.circuitRadiators, db.systemSettings, db.calculationResults], async () => {
    await db.calculationResults.where('projectId').equals(id).delete();
    await db.systemSettings.where('projectId').equals(id).delete();
    const circuits = await db.circuits.where('projectId').equals(id).toArray();
    for (const circuit of circuits) {
      if (circuit.id) {
        await db.circuitRadiators.where('circuitId').equals(circuit.id).delete();
      }
    }
    await db.circuits.where('projectId').equals(id).delete();
    await db.radiators.where('projectId').equals(id).delete();
    await db.rooms.where('projectId').equals(id).delete();
    await db.projects.delete(id);
  });
}

export async function createRoom(data: Omit<Room, 'id'>) {
  return db.rooms.add(data as Room);
}

export async function updateRoom(id: number, data: Partial<Room>) {
  await db.rooms.update(id, data);
}

export async function deleteRoom(id: number) {
  await db.transaction('rw', [db.rooms, db.radiators, db.calculationResults], async () => {
    await db.calculationResults.where('roomId').equals(id).delete();
    await db.radiators.where('roomId').equals(id).delete();
    await db.rooms.delete(id);
  });
}

export async function createRadiator(data: Omit<Radiator, 'id'>) {
  return db.radiators.add(data as Radiator);
}

export async function updateRadiator(id: number, data: Partial<Radiator>) {
  await db.radiators.update(id, data);
}

export async function deleteRadiator(id: number) {
  await db.transaction('rw', [db.radiators, db.circuitRadiators, db.calculationResults], async () => {
    await db.calculationResults.where('radiatorId').equals(id).delete();
    await db.circuitRadiators.where('radiatorId').equals(id).delete();
    await db.radiators.delete(id);
  });
}

export async function createCircuit(data: Omit<Circuit, 'id'>) {
  return db.circuits.add(data as Circuit);
}

export async function updateCircuit(id: number, data: Partial<Circuit>) {
  await db.circuits.update(id, data);
}

export async function deleteCircuit(id: number) {
  await db.transaction('rw', [db.circuits, db.circuitRadiators], async () => {
    await db.circuitRadiators.where('circuitId').equals(id).delete();
    await db.circuits.delete(id);
  });
}

export async function addRadiatorToCircuit(data: Omit<CircuitRadiator, 'id'>) {
  return db.circuitRadiators.add(data as CircuitRadiator);
}

export async function updateCircuitRadiator(id: number, data: Partial<CircuitRadiator>) {
  await db.circuitRadiators.update(id, data);
}

export async function removeRadiatorFromCircuit(id: number) {
  await db.circuitRadiators.delete(id);
}

export async function updateSystemSettings(projectId: number, data: Partial<SystemSettings>) {
  const existing = await db.systemSettings.where('projectId').equals(projectId).first();
  if (existing?.id) {
    await db.systemSettings.update(existing.id, data);
  }
}
