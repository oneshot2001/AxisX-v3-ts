import { describe, it, expect, beforeAll } from 'vitest';
import { initAccessoryData } from '@/core/accessory';
import { resolveMountPairWithConfidence, pairMountsForBatch } from '@/core/accessory/mountPairer';
import type { AccessoryCompatDatabase, BatchSearchItem, SearchResponse, SearchResult } from '@/types';
import testAccessoryData from './fixtures/accessory-test-data.json';

beforeAll(() => {
  initAccessoryData(testAccessoryData as unknown as AccessoryCompatDatabase);
});

describe('resolveMountPairWithConfidence', () => {
  // Exact model match
  it('returns pole mount for P3285-LVE + pole placement', () => {
    const result = resolveMountPairWithConfidence('P3285-LVE', 'pole');
    expect(result.mount).not.toBeNull();
    expect(result.mount!.mountPlacement).toBe('pole');
    expect(result.mount!.model).toBe('T91B47-POLE');
    expect(result.mountConfidence).toBe('exact');
  });

  it('returns wall mount for P3285-LVE + wall placement', () => {
    const result = resolveMountPairWithConfidence('P3285-LVE', 'wall');
    expect(result.mount).not.toBeNull();
    expect(result.mount!.mountPlacement).toBe('wall');
  });

  it('returns ceiling mount for P3285-LVE + ceiling placement', () => {
    const result = resolveMountPairWithConfidence('P3285-LVE', 'ceiling');
    expect(result.mount).not.toBeNull();
    expect(result.mount!.mountPlacement).toBe('ceiling');
    expect(result.mount!.model).toBe('T91B50');
  });

  it('returns recessed mount for M4215-LV + recessed placement', () => {
    const result = resolveMountPairWithConfidence('M4215-LV', 'recessed');
    expect(result.mount).not.toBeNull();
    expect(result.mount!.mountPlacement).toBe('recessed');
    expect(result.mount!.model).toBe('T94C01L');
  });

  it('returns null when no mount matches placement', () => {
    // P3285-LVE has no parapet mount
    const result = resolveMountPairWithConfidence('P3285-LVE', 'parapet');
    expect(result.mount).toBeNull();
    expect(result.mountConfidence).toBe('none');
  });

  // Priority logic
  it('prefers recommended mount over compatible', () => {
    // P3285-LVE has two wall mounts: T91H61 (recommended, requiresAdditional: true)
    // and TP3005-E (compatible, requiresAdditional: false)
    // recommended should win over compatible
    const result = resolveMountPairWithConfidence('P3285-LVE', 'wall');
    expect(result.mount!.recommendation).toBe('recommended');
    expect(result.mount!.model).toBe('T91H61');
  });

  it('prefers mount that does not require additional accessory', () => {
    // M4215-LV has two recessed mounts:
    // T94C01L (recommended, requiresAdditional: false) and TM4201 (compatible, requiresAdditional: false)
    // T94C01L wins on recommendation priority
    const result = resolveMountPairWithConfidence('M4215-LV', 'recessed');
    expect(result.mount!.model).toBe('T94C01L');
    expect(result.mount!.requiresAdditional).toBe(false);
  });

  it('returns first match when multiple equally ranked', () => {
    // Just ensure we get a deterministic result
    const result = resolveMountPairWithConfidence('P3285-LVE', 'pole');
    expect(result.mount).not.toBeNull();
  });

  // Series fallback
  it('falls back to series match when exact model not found', () => {
    // P3299-XYZ doesn't exist but P32 series (P3285-LVE) does
    const result = resolveMountPairWithConfidence('P3299-XYZ', 'pole');
    expect(result.mount).not.toBeNull();
    expect(result.mountConfidence).toBe('series-fallback');
  });

  it('sets mountConfidence to "series-fallback" on series match', () => {
    const result = resolveMountPairWithConfidence('P3299-XYZ', 'wall');
    expect(result.mountConfidence).toBe('series-fallback');
  });

  it('sets mountWarning on series fallback', () => {
    const result = resolveMountPairWithConfidence('P3299-XYZ', 'pole');
    expect(result.mountWarning).toBeDefined();
    expect(result.mountWarning).toContain('P3299-XYZ');
  });

  // Form factor default
  it('suggests dome mounts for unknown dome camera', () => {
    // UNKNOWN-123 has no data. "fixed-dome" defaults include wall.
    const result = resolveMountPairWithConfidence('UNKNOWN-123', 'wall', 'fixed-dome');
    expect(result.mount).toBeNull();
    expect(result.mountConfidence).toBe('form-factor-default');
  });

  it('suggests bullet mounts for unknown bullet camera', () => {
    const result = resolveMountPairWithConfidence('UNKNOWN-456', 'wall', 'fixed-bullet');
    expect(result.mountConfidence).toBe('form-factor-default');
  });

  it('suggests PTZ mounts for unknown PTZ camera', () => {
    const result = resolveMountPairWithConfidence('UNKNOWN-789', 'pole', 'ptz');
    expect(result.mountConfidence).toBe('form-factor-default');
  });

  it('sets mountConfidence to "form-factor-default"', () => {
    const result = resolveMountPairWithConfidence('UNKNOWN-123', 'ceiling', 'fixed-dome');
    expect(result.mountConfidence).toBe('form-factor-default');
    expect(result.mountWarning).toContain('fixed-dome');
  });

  // No match
  it('returns null with mountConfidence "none" when nothing found', () => {
    const result = resolveMountPairWithConfidence('TOTALLY-UNKNOWN', 'corner');
    expect(result.mount).toBeNull();
    expect(result.mountConfidence).toBe('none');
    expect(result.mountWarning).toContain('corner');
  });
});

describe('pairMountsForBatch', () => {
  const mockResult: SearchResult = {
    score: 95,
    type: 'exact',
    mapping: {
      competitor_model: 'DS-2CD2143G2-I',
      competitor_manufacturer: 'Hikvision',
      axis_replacement: 'P3285-LVE',
      match_confidence: 95,
    },
    isLegacy: false,
    axisUrl: 'https://www.axis.com/products/axis-p3285-lve',
    category: 'ndaa-banned',
  };

  const mockResponse: SearchResponse = {
    query: 'DS-2CD2143G2-I',
    queryType: 'competitor',
    results: [mockResult],
    grouped: { exact: [mockResult], partial: [], similar: [] },
    suggestions: [],
    confidence: 'high',
    durationMs: 5,
  };

  const makeItem = (
    overrides: Partial<BatchSearchItem> = {}
  ): BatchSearchItem => ({
    id: `test-${Math.random()}`,
    input: 'DS-2CD2143G2-I',
    quantity: 1,
    selected: true,
    status: 'complete' as const,
    response: mockResponse,
    ...overrides,
  });

  it('pairs mounts for all items with mountType', () => {
    const items = [
      makeItem({ mountType: 'pole' }),
      makeItem({ mountType: 'wall' }),
    ];
    const result = pairMountsForBatch(items);
    expect(result[0]!.mountPairing).toBeDefined();
    expect(result[0]!.mountPairing!.mount!.mountPlacement).toBe('pole');
    expect(result[1]!.mountPairing).toBeDefined();
    expect(result[1]!.mountPairing!.mount!.mountPlacement).toBe('wall');
  });

  it('skips items without mountType', () => {
    const items = [makeItem()]; // no mountType
    const result = pairMountsForBatch(items);
    expect(result[0]!.mountPairing).toBeUndefined();
  });

  it('skips items with failed cross-reference (no search result)', () => {
    const items = [
      makeItem({
        mountType: 'pole',
        status: 'error' as const,
        response: undefined,
      }),
    ];
    const result = pairMountsForBatch(items);
    expect(result[0]!.mountPairing).toBeUndefined();
  });

  it('handles mixed: some with mountType, some without', () => {
    const items = [
      makeItem({ mountType: 'pole' }),
      makeItem(), // no mountType
      makeItem({ mountType: 'ceiling' }),
    ];
    const result = pairMountsForBatch(items);
    expect(result[0]!.mountPairing).toBeDefined();
    expect(result[1]!.mountPairing).toBeUndefined();
    expect(result[2]!.mountPairing).toBeDefined();
  });

  it('handles 200 items efficiently (< 100ms)', () => {
    const items = Array.from({ length: 200 }, () =>
      makeItem({ mountType: 'pole' })
    );
    const start = performance.now();
    const result = pairMountsForBatch(items);
    const elapsed = performance.now() - start;
    expect(result).toHaveLength(200);
    expect(elapsed).toBeLessThan(100);
  });

  it('does not modify items without mountType', () => {
    const original = makeItem();
    const items = [original];
    const result = pairMountsForBatch(items);
    // Should be the same object reference (not a copy)
    expect(result[0]).toBe(original);
  });
});
