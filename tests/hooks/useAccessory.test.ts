/**
 * useAccessory Hook Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccessory } from '@/hooks/useAccessory';
import { initAccessoryData } from '@/core/accessory';
import type { AccessoryCompatDatabase } from '@/types';
import testAccessoryData from '../fixtures/accessory-test-data.json';

beforeAll(() => {
  initAccessoryData(testAccessoryData as AccessoryCompatDatabase);
});

describe('useAccessory', () => {
  it('reports isLoaded as true when data initialized', () => {
    const { result } = renderHook(() => useAccessory());
    expect(result.current.isLoaded).toBe(true);
  });

  it('getAccessories returns all accessories for a model', () => {
    const { result } = renderHook(() => useAccessory());
    const accessories = result.current.getAccessories('P3285-LVE');
    expect(accessories.length).toBe(5);
  });

  it('getByType filters by mount type', () => {
    const { result } = renderHook(() => useAccessory());
    const mounts = result.current.getByType('P3285-LVE', 'mount');
    expect(mounts.length).toBe(4);
    for (const m of mounts) {
      expect(m.accessoryType).toBe('mount');
    }
  });

  it('getByType filters by power type', () => {
    const { result } = renderHook(() => useAccessory());
    const power = result.current.getByType('P3285-LVE', 'power');
    expect(power.length).toBe(1);
    expect(power[0]!.accessoryType).toBe('power');
  });

  it('getRecommended returns only recommended accessories', () => {
    const { result } = renderHook(() => useAccessory());
    const recommended = result.current.getRecommended('P3285-LVE');
    for (const r of recommended) {
      expect(r.recommendation).toBe('recommended');
    }
  });

  it('getMountsByPlacement returns mounts for placement', () => {
    const { result } = renderHook(() => useAccessory());
    const poleMounts = result.current.getMountsByPlacement('P3285-LVE', 'pole');
    expect(poleMounts.length).toBeGreaterThan(0);
    for (const m of poleMounts) {
      expect(m.mountPlacement).toBe('pole');
    }
  });

  it('hasCompatibility returns true for known model', () => {
    const { result } = renderHook(() => useAccessory());
    expect(result.current.hasCompatibility('P3285-LVE')).toBe(true);
  });

  it('hasCompatibility returns false for unknown model', () => {
    const { result } = renderHook(() => useAccessory());
    expect(result.current.hasCompatibility('UNKNOWN-999')).toBe(false);
  });

  it('getAccessories returns empty array for unknown model', () => {
    const { result } = renderHook(() => useAccessory());
    const accessories = result.current.getAccessories('UNKNOWN-999');
    expect(accessories).toHaveLength(0);
  });
});
