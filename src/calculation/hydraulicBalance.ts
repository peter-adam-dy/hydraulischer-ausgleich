import type { Room, Radiator, SystemSettings, CircuitRadiator } from '../types/index.ts';
import { calculateHeatingLoad, type HeatingLoadResult } from './heatingLoad.ts';
import { calculateActualOutput } from './radiatorOutput.ts';
import { calculateFlowRate } from './flowRate.ts';
import { calculatePressureLoss } from './pressureLoss.ts';
import { calculateKv, findValvePreset } from './valvePreset.ts';

export interface RadiatorResult {
  radiatorId: number;
  roomId: number;
  roomName: string;
  radiatorType: string;
  heatingLoad: number;
  ratedOutput: number;
  actualOutput: number;
  coveragePercent: number;
  flowRate: number; // L/h
  pressureLoss: number; // Pa
  kvValue: number;
  valvePreset: string | undefined;
  effectiveValveType: string;
  effectiveValveDn: number;
}

export interface RoomResult {
  roomId: number;
  roomName: string;
  heatingLoad: HeatingLoadResult;
  radiators: RadiatorResult[];
  totalRadiatorOutput: number;
  coveragePercent: number;
}

export interface SystemResult {
  rooms: RoomResult[];
  totalHeatingLoad: number;
  totalFlowRate: number;
  criticalRadiator: RadiatorResult | undefined;
}

export function calculateHydraulicBalance(
  rooms: Room[],
  radiators: Radiator[],
  circuitRadiators: CircuitRadiator[],
  settings: SystemSettings,
  designOutdoorTemp: number,
): SystemResult {
  const roomResults: RoomResult[] = [];
  const allRadiatorResults: RadiatorResult[] = [];
  let totalHeatingLoad = 0;
  let totalFlowRate = 0;

  for (const room of rooms) {
    const heatingLoad = calculateHeatingLoad(room, designOutdoorTemp);
    totalHeatingLoad += heatingLoad.totalHeatingLoad;

    const roomRads = radiators.filter((r) => r.roomId === room.id);
    const radResults: RadiatorResult[] = [];

    // Distribute heating load proportionally if multiple radiators
    const totalRatedOutput = roomRads.reduce((sum, r) => sum + r.ratedOutputDeltaT50, 0);

    for (const rad of roomRads) {
      const proportion = totalRatedOutput > 0 ? rad.ratedOutputDeltaT50 / totalRatedOutput : 1;
      const radHeatingLoad = Math.round(heatingLoad.totalHeatingLoad * proportion);

      const actualOutput = calculateActualOutput(
        rad.ratedOutputDeltaT50,
        settings.supplyTemp,
        settings.returnTemp,
        room.desiredTemp,
      );

      // Flow rate based on the radiator's share of heating load
      const flowRate = calculateFlowRate(radHeatingLoad, settings.supplyTemp, settings.returnTemp);

      // Find pipe length from circuit assignment (supply + return)
      const circuitRad = circuitRadiators.find((cr) => cr.radiatorId === rad.id);
      const supplyLength = circuitRad?.estimatedPipeLength ?? 10;
      const returnLength = circuitRad?.pipeLengthReturn ?? supplyLength;
      const pipeLength = supplyLength + returnLength;

      const pressureLoss = calculatePressureLoss(settings.specificPressureLoss, pipeLength);

      const kvValue = calculateKv(flowRate, pressureLoss);

      const effectiveValveType = rad.valveType ?? settings.valveType;
      const effectiveDn = rad.valveDn ?? settings.valveDn ?? 15;
      const preset = findValvePreset(effectiveValveType, effectiveDn, kvValue);

      const result: RadiatorResult = {
        radiatorId: rad.id!,
        roomId: room.id!,
        roomName: room.name,
        radiatorType: rad.type,
        heatingLoad: radHeatingLoad,
        ratedOutput: rad.ratedOutputDeltaT50,
        actualOutput,
        coveragePercent: radHeatingLoad > 0 ? Math.round((actualOutput / radHeatingLoad) * 100) : 0,
        flowRate: Math.round(flowRate * 10) / 10,
        pressureLoss: Math.round(pressureLoss),
        kvValue: Math.round(kvValue * 1000) / 1000,
        valvePreset: preset?.setting,
        effectiveValveType,
        effectiveValveDn: effectiveDn,
      };

      radResults.push(result);
      allRadiatorResults.push(result);
      totalFlowRate += flowRate;
    }

    const totalRadiatorOutput = radResults.reduce((sum, r) => sum + r.actualOutput, 0);

    roomResults.push({
      roomId: room.id!,
      roomName: room.name,
      heatingLoad,
      radiators: radResults,
      totalRadiatorOutput,
      coveragePercent: heatingLoad.totalHeatingLoad > 0
        ? Math.round((totalRadiatorOutput / heatingLoad.totalHeatingLoad) * 100)
        : 0,
    });
  }

  // Critical radiator = highest pressure loss (most unfavorable)
  const criticalRadiator = allRadiatorResults.reduce<RadiatorResult | undefined>(
    (max, r) => (!max || r.pressureLoss > max.pressureLoss ? r : max),
    undefined,
  );

  return {
    rooms: roomResults,
    totalHeatingLoad,
    totalFlowRate: Math.round(totalFlowRate * 10) / 10,
    criticalRadiator,
  };
}
