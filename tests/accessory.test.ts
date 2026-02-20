import { describe, it, expect, beforeAll } from 'vitest';
import { initAccessoryData, getAccessoryLookup, AccessoryLookup } from '@/core/accessory';
import type { AccessoryCompatDatabase } from '@/types';
import testAccessoryData from './fixtures/accessory-test-data.json';

let lookup: AccessoryLookup;

beforeAll(() => {
  initAccessoryData(testAccessoryData as unknown as AccessoryCompatDatabase);
  lookup = getAccessoryLookup();
});

describe('AccessoryLookup', () => {
  // Initialization
  it('initializes from accessory_compatibility.json', () => {
    expect(lookup).toBeDefined();
  });

  it('reports correct size', () => {
    expect(lookup.size).toBe(3);
  });

  // Exact model lookup
  it('returns accessories for exact model (P3285-LVE)', () => {
    const accessories = lookup.getCompatible('P3285-LVE');
    expect(accessories.length).toBe(5);
  });

  it('normalizes model input (strips AXIS prefix, handles case)', () => {
    const a = lookup.getCompatible('axis p3285-lve');
    const b = lookup.getCompatible('AXIS P3285-LVE');
    const c = lookup.getCompatible('P3285-LVE');
    expect(a.length).toBe(5);
    expect(b.length).toBe(5);
    expect(c.length).toBe(5);
  });

  it('returns empty array for unknown model', () => {
    const accessories = lookup.getCompatible('UNKNOWN-MODEL');
    expect(accessories.length).toBe(0);
  });

  // Type filtering
  it('filters by type (mount)', () => {
    const mounts = lookup.getByType('P3285-LVE', 'mount');
    expect(mounts.length).toBe(4);
    expect(mounts.every((m) => m.accessoryType === 'mount')).toBe(true);
  });

  it('filters by type (power)', () => {
    const power = lookup.getByType('P3285-LVE', 'power');
    expect(power.length).toBe(1);
    expect(power[0].model).toBe('T8120');
  });

  it('returns empty when no accessories match type', () => {
    const switches = lookup.getByType('P3285-LVE', 'switches');
    expect(switches.length).toBe(0);
  });

  // Recommendation filtering
  it('returns only recommended accessories', () => {
    const rec = lookup.getRecommended('P3285-LVE');
    expect(rec.every((a) => a.recommendation === 'recommended')).toBe(true);
    expect(rec.length).toBe(3); // T91B47-POLE, T91H61, T91B50
  });

  // Mount placement filtering
  it('filters mounts by placement (pole)', () => {
    const pole = lookup.getMountsByPlacement('P3285-LVE', 'pole');
    expect(pole.length).toBe(1);
    expect(pole[0].model).toBe('T91B47-POLE');
  });

  it('filters mounts by placement (wall)', () => {
    const wall = lookup.getMountsByPlacement('P3285-LVE', 'wall');
    expect(wall.length).toBe(2);
  });

  // Series fallback
  it('falls back to series when exact model not found', () => {
    // P3289-LVE doesn't exist, should fall back to P32 series → P3285-LVE
    const accessories = lookup.getCompatible('P3289-LVE');
    expect(accessories.length).toBeGreaterThan(0);
  });

  it('P3285-LVE-EUR resolves via base model', () => {
    const accessories = lookup.getCompatible('P3285-LVE-EUR');
    expect(accessories.length).toBe(5);
  });

  // Edge cases
  it('handles model with no accessories', () => {
    const accessories = lookup.getCompatible('NONEXISTENT-1234');
    expect(accessories).toEqual([]);
  });

  it('deduplicates on series fallback', () => {
    // M4215-LV exists directly — should get exactly its accessories, not duplicated
    const accessories = lookup.getCompatible('M4215-LV');
    const models = accessories.map((a) => a.model);
    const unique = new Set(models);
    expect(models.length).toBe(unique.size);
  });
});

describe('resolveMountPair', () => {
  // Exact model match
  it('returns pole mount for P3285-LVE + pole placement', () => {
    const mount = lookup.resolveMountPair('P3285-LVE', 'pole');
    expect(mount).not.toBeNull();
    expect(mount!.model).toBe('T91B47-POLE');
    expect(mount!.mountPlacement).toBe('pole');
  });

  it('returns wall mount for P3285-LVE + wall placement', () => {
    const mount = lookup.resolveMountPair('P3285-LVE', 'wall');
    expect(mount).not.toBeNull();
    expect(mount!.mountPlacement).toBe('wall');
  });

  it('returns ceiling mount for P3285-LVE + ceiling placement', () => {
    const mount = lookup.resolveMountPair('P3285-LVE', 'ceiling');
    expect(mount).not.toBeNull();
    expect(mount!.mountPlacement).toBe('ceiling');
  });

  it('returns recessed mount for M4215-LV + recessed placement', () => {
    const mount = lookup.resolveMountPair('M4215-LV', 'recessed');
    expect(mount).not.toBeNull();
    expect(mount!.model).toBe('T94C01L');
    expect(mount!.mountPlacement).toBe('recessed');
  });

  it('returns null when no mount matches placement', () => {
    const mount = lookup.resolveMountPair('P3285-LVE', 'parapet');
    expect(mount).toBeNull();
  });

  // Priority logic
  it('prefers recommended mount over compatible', () => {
    // P3285-LVE wall: T91H61 (recommended, requiresAdditional) vs TP3005-E (compatible, no additional)
    const mount = lookup.resolveMountPair('P3285-LVE', 'wall');
    expect(mount!.recommendation).toBe('recommended');
    expect(mount!.model).toBe('T91H61');
  });

  it('prefers mount that does not require additional accessory', () => {
    // M4215-LV recessed: T94C01L (recommended, no additional) vs TM4201 (compatible, no additional)
    const mount = lookup.resolveMountPair('M4215-LV', 'recessed');
    expect(mount!.recommendation).toBe('recommended');
    expect(mount!.requiresAdditional).toBe(false);
  });

  it('returns first match when multiple equally ranked', () => {
    const mount = lookup.resolveMountPair('P3285-LVE', 'pole');
    expect(mount).not.toBeNull();
    // Only one pole mount, so it should always return it
    expect(mount!.model).toBe('T91B47-POLE');
  });

  // Series fallback
  it('falls back to series match when exact model not found', () => {
    // P3289-LVE doesn't exist → falls back to P32 series
    const mount = lookup.resolveMountPair('P3289-LVE', 'pole');
    expect(mount).not.toBeNull();
    expect(mount!.mountPlacement).toBe('pole');
  });

  // No match
  it('returns null when nothing found', () => {
    const mount = lookup.resolveMountPair('NONEXISTENT-123', 'pole');
    expect(mount).toBeNull();
  });
});

describe('resolveWithConfidence', () => {
  it('returns exact confidence for direct model match', () => {
    const result = lookup.resolveWithConfidence('P3285-LVE');
    expect(result.confidence).toBe('exact');
    expect(result.entry).not.toBeNull();
  });

  it('returns exact confidence for base model match', () => {
    const result = lookup.resolveWithConfidence('P3285-LVE-EUR');
    expect(result.confidence).toBe('exact');
  });

  it('returns series-fallback confidence for series match', () => {
    const result = lookup.resolveWithConfidence('P3289-LVE');
    expect(result.confidence).toBe('series-fallback');
    expect(result.warning).toBeDefined();
  });

  it('returns none confidence when nothing found', () => {
    const result = lookup.resolveWithConfidence('NONEXISTENT-123');
    expect(result.confidence).toBe('none');
    expect(result.entry).toBeNull();
  });
});
