/**
 * Tests: Accessory Query Detection & Engine Routing
 * Tests that the query parser correctly detects accessory-lookup queries
 * and routes them through the search engine.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseQuery } from '@/core/search/queryParser';
import { createSearchEngine } from '@/core/search/engine';
import { initAccessoryData } from '@/core/accessory';
import type { AccessoryCompatDatabase, SearchResponse } from '@/types';
import testAccessoryData from './fixtures/accessory-test-data.json';

// =============================================================================
// SETUP
// =============================================================================

beforeAll(() => {
  initAccessoryData(testAccessoryData as AccessoryCompatDatabase);
});

// =============================================================================
// QUERY DETECTION
// =============================================================================

describe('Accessory Query Detection', () => {
  it('detects "mounts for P3285-LVE" as accessory-lookup', () => {
    const parsed = parseQuery('mounts for P3285-LVE');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('P3285-LVE');
  });

  it('detects "pole mount for P14 series" as accessory-lookup', () => {
    const parsed = parseQuery('pole mount for P14 series');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('P14');
    expect(parsed.accessoryPlacement).toBe('pole');
  });

  it('detects "accessories for M4215" as accessory-lookup', () => {
    const parsed = parseQuery('accessories for M4215');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('M4215');
  });

  it('detects "what mounts work with P3265-LVE" as accessory-lookup', () => {
    const parsed = parseQuery('what mounts work with P3265-LVE');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('P3265-LVE');
  });

  it('does NOT detect "P3285-LVE" alone as accessory-lookup', () => {
    const parsed = parseQuery('P3285-LVE');
    expect(parsed.type).not.toBe('accessory-lookup');
    expect(parsed.type).toBe('axis-model');
  });

  it('does NOT detect "Hikvision mounts" as accessory-lookup', () => {
    // "Hikvision" is a manufacturer — should route to manufacturer, not accessory
    const parsed = parseQuery('Hikvision mounts');
    expect(parsed.type).not.toBe('accessory-lookup');
  });

  it('extracts placement filter from "wall mount for P3285-LVE"', () => {
    const parsed = parseQuery('wall mount for P3285-LVE');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('P3285-LVE');
    expect(parsed.accessoryPlacement).toBe('wall');
  });

  it('extracts placement filter from "ceiling mount for M4215-LV"', () => {
    const parsed = parseQuery('ceiling mount for M4215-LV');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('M4215-LV');
    expect(parsed.accessoryPlacement).toBe('ceiling');
  });

  it('detects "show mounts for Q6135-LE" as accessory-lookup', () => {
    const parsed = parseQuery('show mounts for Q6135-LE');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('Q6135-LE');
  });

  it('detects "mounting for P3285-LVE" as accessory-lookup', () => {
    const parsed = parseQuery('mounting for P3285-LVE');
    expect(parsed.type).toBe('accessory-lookup');
    expect(parsed.accessoryModel).toBe('P3285-LVE');
  });
});

// =============================================================================
// ENGINE ROUTING
// =============================================================================

describe('Accessory Query Engine Routing', () => {
  let response: SearchResponse;

  it('routes accessory-lookup to accessory handler', () => {
    const engine = createSearchEngine([], [], (m) => `https://axis.com/products/axis-${m.toLowerCase()}`);
    response = engine.search('mounts for P3285-LVE');
    expect(response.queryType).toBe('accessory-lookup');
  });

  it('returns AccessorySearchResponse', () => {
    const engine = createSearchEngine([], [], (m) => `https://axis.com/products/axis-${m.toLowerCase()}`);
    response = engine.search('mounts for P3285-LVE');
    expect(response.accessoryResults).toBeDefined();
    expect(response.accessoryResults!.cameraModel).toBe('P3285-LVE');
    expect(response.accessoryResults!.accessories.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown model', () => {
    const engine = createSearchEngine([], [], (m) => `https://axis.com/products/axis-${m.toLowerCase()}`);
    response = engine.search('mounts for P9999-XX');
    expect(response.queryType).toBe('accessory-lookup');
    expect(response.accessoryResults).toBeDefined();
    expect(response.accessoryResults!.accessories).toHaveLength(0);
  });

  it('filters by placement when specified', () => {
    const engine = createSearchEngine([], [], (m) => `https://axis.com/products/axis-${m.toLowerCase()}`);
    response = engine.search('wall mount for P3285-LVE');
    expect(response.accessoryResults).toBeDefined();
    expect(response.accessoryResults!.filters.placement).toBe('wall');
    // Should only return wall mounts
    for (const acc of response.accessoryResults!.accessories) {
      expect(acc.mountPlacement).toBe('wall');
    }
  });
});
