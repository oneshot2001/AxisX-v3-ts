/**
 * Spec Lookup Module
 *
 * Product specification lookup with normalized model key matching.
 * Mirrors the singleton pattern from src/core/msrp/lookup.ts.
 */

import type {
  AxisProductSpec,
  AxisProductType,
  AxisSpecDatabase,
  CameraSubcategory,
  ISpecLookup,
} from '@/types';

// =============================================================================
// SPEC LOOKUP IMPLEMENTATION
// =============================================================================

export class SpecLookup implements ISpecLookup {
  private data: Map<string, AxisProductSpec> = new Map();

  constructor(specDatabase: AxisSpecDatabase) {
    for (const [key, spec] of Object.entries(specDatabase.products)) {
      this.data.set(this.normalize(key), spec as AxisProductSpec);
    }
  }

  /**
   * Look up spec by model key
   */
  lookupSpec(model: string): AxisProductSpec | null {
    const normalized = this.normalize(model);

    // Direct match
    const direct = this.data.get(normalized);
    if (direct) return direct;

    // Base model fallback (strip variant suffixes)
    const base = this.getBaseModel(normalized);
    if (base !== normalized) {
      const baseSpec = this.data.get(base);
      if (baseSpec) return baseSpec;
    }

    return null;
  }

  /**
   * Check if model has spec data
   */
  hasSpec(model: string): boolean {
    return this.lookupSpec(model) !== null;
  }

  /**
   * Get all products of a given type
   */
  getByType(type: AxisProductType): AxisProductSpec[] {
    const results: AxisProductSpec[] = [];
    for (const spec of this.data.values()) {
      if (spec.productType === type) {
        results.push(spec);
      }
    }
    return results;
  }

  /**
   * Get cameras by subcategory
   */
  getByCameraType(subcat: CameraSubcategory): AxisProductSpec[] {
    const results: AxisProductSpec[] = [];
    for (const spec of this.data.values()) {
      if (spec.productType === 'camera' && spec.cameraType === subcat) {
        results.push(spec);
      }
    }
    return results;
  }

  /**
   * Total number of products in the database
   */
  get size(): number {
    return this.data.size;
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private normalize(model: string): string {
    return model
      .toUpperCase()
      .replace(/^AXIS\s*/i, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private getBaseModel(model: string): string {
    const suffixes = [
      '-60HZ', '-50HZ', '60HZ', '50HZ',
      '-EUR', '-US', '-BR', '-NM', '-AR',
      '-24V', '-M12', '-ZOOM',
      '-BULK', 'BULK',
    ];

    let base = model;
    for (const suffix of suffixes) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length);
      }
    }

    base = base.replace(/-\d+MM$/i, '');
    return base.replace(/-+$/, '');
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let specInstance: SpecLookup | null = null;

/**
 * Initialize spec lookup (call once with data)
 */
export function initSpecs(data: AxisSpecDatabase): ISpecLookup {
  specInstance = new SpecLookup(data);
  return specInstance;
}

/**
 * Get spec lookup instance
 */
export function getSpecs(): ISpecLookup {
  if (!specInstance) {
    throw new Error('Specs not initialized. Call initSpecs() first.');
  }
  return specInstance;
}

/**
 * Convenience: look up spec for a model
 */
export function lookupSpec(model: string): AxisProductSpec | null {
  return getSpecs().lookupSpec(model);
}

/**
 * Convenience: check if spec exists
 */
export function hasSpec(model: string): boolean {
  return getSpecs().hasSpec(model);
}
