import { describe, it, expect } from 'vitest';
import {
  calculateComponentTransmissionLoss,
  calculateVentilationLoss,
  calculateHeatingLoad,
} from '../heatingLoad.ts';
import type { BuildingComponent, Room } from '../../types/index.ts';

describe('heatingLoad', () => {
  describe('calculateComponentTransmissionLoss', () => {
    it('calculates loss for exterior wall without windows', () => {
      const component: BuildingComponent = {
        id: '1',
        type: 'exterior_wall',
        area: 10,
        uValue: 1.4,
        adjacentTemp: null,
        windows: [],
      };
      // U × A × ΔT = 1.4 × 10 × (20 - (-13)) = 1.4 × 10 × 33 = 462
      const loss = calculateComponentTransmissionLoss(component, 20, -13);
      expect(loss).toBe(462);
    });

    it('calculates loss for wall with window (net area)', () => {
      const component: BuildingComponent = {
        id: '1',
        type: 'exterior_wall',
        area: 10,
        uValue: 1.4,
        adjacentTemp: null,
        windows: [{ id: 'w1', area: 2, uValue: 2.8 }],
      };
      // Net wall: 1.4 × (10-2) × 33 = 369.6
      // Window: 2.8 × 2 × 33 = 184.8
      // Total: 554.4
      const loss = calculateComponentTransmissionLoss(component, 20, -13);
      expect(loss).toBeCloseTo(554.4, 1);
    });

    it('uses adjacent temp for interior walls', () => {
      const component: BuildingComponent = {
        id: '1',
        type: 'interior_wall',
        area: 8,
        uValue: 0.6,
        adjacentTemp: 10,
        windows: [],
      };
      // 0.6 × 8 × (20 - 10) = 48
      const loss = calculateComponentTransmissionLoss(component, 20, -13);
      expect(loss).toBe(48);
    });

    it('returns 0 when deltaT is zero or negative', () => {
      const component: BuildingComponent = {
        id: '1',
        type: 'exterior_wall',
        area: 10,
        uValue: 1.4,
        adjacentTemp: null,
        windows: [],
      };
      expect(calculateComponentTransmissionLoss(component, -15, -13)).toBe(0);
    });
  });

  describe('calculateVentilationLoss', () => {
    it('calculates ventilation loss correctly', () => {
      const room: Room = {
        projectId: 1,
        name: 'Test',
        usageType: 'living_room',
        length: 5,
        width: 4,
        height: 2.5,
        floorPosition: 'upper',
        desiredTemp: 20,
        airChangeRate: 0.5,
        buildingComponents: [],
      };
      // 0.34 × (5×4×2.5) × 0.5 × (20-(-13)) = 0.34 × 50 × 0.5 × 33 = 280.5 → 281
      const loss = calculateVentilationLoss(room, -13);
      expect(loss).toBe(281);
    });
  });

  describe('calculateHeatingLoad', () => {
    it('returns sum of transmission and ventilation losses', () => {
      const room: Room = {
        projectId: 1,
        name: 'Living Room',
        usageType: 'living_room',
        length: 5,
        width: 4,
        height: 2.5,
        floorPosition: 'upper',
        desiredTemp: 20,
        airChangeRate: 0.5,
        buildingComponents: [
          {
            id: '1',
            type: 'exterior_wall',
            area: 10,
            uValue: 1.4,
            adjacentTemp: null,
            windows: [{ id: 'w1', area: 2, uValue: 2.8 }],
          },
        ],
      };
      const result = calculateHeatingLoad(room, -13);
      expect(result.transmissionLoss).toBe(554);
      expect(result.ventilationLoss).toBe(281);
      expect(result.totalHeatingLoad).toBe(554 + 281);
    });
  });
});
