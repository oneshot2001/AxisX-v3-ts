/**
 * Axis Catalog Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import { AXIS_CATALOG, getCatalogModelCount } from '@/data/axisCatalog';

describe('AXIS_CATALOG', () => {
  it('has at least 8 categories', () => {
    expect(AXIS_CATALOG.length).toBeGreaterThanOrEqual(8);
  });

  it('every category has at least 1 series', () => {
    for (const category of AXIS_CATALOG) {
      expect(category.series.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every series has at least 1 model', () => {
    for (const category of AXIS_CATALOG) {
      for (const series of category.series) {
        expect(series.models.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('has no duplicate models across the entire catalog', () => {
    const allModels: string[] = [];
    for (const category of AXIS_CATALOG) {
      for (const series of category.series) {
        allModels.push(...series.models);
      }
    }

    const uniqueModels = new Set(allModels);
    expect(uniqueModels.size).toBe(allModels.length);
  });

  it('model names match expected format (letter + digits + optional suffix)', () => {
    // Standard: P3265-LVE, M7104, Q6135-LE
    // Mounts: T91A23, T91B53, T91D61
    // Numeric-prefix: 291-1U (legacy encoders)
    const modelPattern = /^[A-Z]\d{1,5}|^\d{3}/;
    for (const category of AXIS_CATALOG) {
      for (const series of category.series) {
        for (const model of series.models) {
          expect(model).toMatch(modelPattern);
        }
      }
    }
  });

  it('every category has required fields', () => {
    for (const category of AXIS_CATALOG) {
      expect(category.id).toBeTruthy();
      expect(category.label).toBeTruthy();
      expect(category.description).toBeTruthy();
    }
  });

  it('every series has required fields', () => {
    for (const category of AXIS_CATALOG) {
      for (const series of category.series) {
        expect(series.id).toBeTruthy();
        expect(series.label).toBeTruthy();
        expect(series.description).toBeTruthy();
      }
    }
  });

  it('contains expected categories', () => {
    const categoryIds = AXIS_CATALOG.map((c) => c.id);
    // Camera categories
    expect(categoryIds).toContain('dome');
    expect(categoryIds).toContain('bullet');
    expect(categoryIds).toContain('box');
    expect(categoryIds).toContain('ptz');
    expect(categoryIds).toContain('panoramic');
    expect(categoryIds).toContain('modular');
    expect(categoryIds).toContain('thermal');
    expect(categoryIds).toContain('specialty');
    // Infrastructure categories
    expect(categoryIds).toContain('recorder');
    expect(categoryIds).toContain('networking');
    expect(categoryIds).toContain('encoder');
    expect(categoryIds).toContain('audio');
    expect(categoryIds).toContain('intercom');
    expect(categoryIds).toContain('mount');
    expect(categoryIds).toContain('radar');
  });
});

describe('getCatalogModelCount', () => {
  it('returns correct total model count', () => {
    let manualCount = 0;
    for (const category of AXIS_CATALOG) {
      for (const series of category.series) {
        manualCount += series.models.length;
      }
    }

    expect(getCatalogModelCount()).toBe(manualCount);
  });

  it('returns a reasonable number of models', () => {
    const count = getCatalogModelCount();
    expect(count).toBeGreaterThan(180);
    expect(count).toBeLessThan(500);
  });
});
