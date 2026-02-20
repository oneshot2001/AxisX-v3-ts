/**
 * Accessory Lookup Module
 *
 * Core accessory compatibility lookup with series-level fallback.
 * Mirrors the singleton pattern from src/core/specs/index.ts.
 *
 * Key function: resolveMountPair() — finds the best mount for a
 * camera + placement combination. Used by batch mount pairing.
 */

import type {
  AccessoryCompatDatabase,
  AccessoryCompatEntry,
  AccessoryRecommendation,
  AccessoryType,
  CameraSubcategory,
  IAccessoryLookup,
  PlacementType,
} from '@/types';
import { normalizeModelKey, getBaseModelKey } from '@/core/model/normalize';

// =============================================================================
// ACCESSORY LOOKUP IMPLEMENTATION
// =============================================================================

/** Recommendation priority (higher = better) */
const RECOMMENDATION_PRIORITY: Record<AccessoryRecommendation, number> = {
  recommended: 3,
  included: 2,
  compatible: 1,
};

/** Default mount placements by camera form factor */
const FORM_FACTOR_DEFAULTS: Record<string, PlacementType[]> = {
  'fixed-dome': ['pendant', 'wall', 'ceiling'],
  'fixed-bullet': ['wall', 'pole'],
  ptz: ['pole', 'parapet', 'wall'],
  panoramic: ['ceiling', 'wall', 'pendant'],
  modular: ['ceiling', 'recessed'],
};

export class AccessoryLookup implements IAccessoryLookup {
  private data: Map<string, { productVariant: string; accessories: AccessoryCompatEntry[] }> =
    new Map();

  constructor(db: AccessoryCompatDatabase) {
    for (const [key, entry] of Object.entries(db.compatibility)) {
      const normalized = normalizeModelKey(key);
      this.data.set(normalized, {
        productVariant: entry.productVariant,
        accessories: entry.accessories as AccessoryCompatEntry[],
      });
    }
  }

  /**
   * Get all compatible accessories for a camera model.
   * Tries exact model → base model → series fallback.
   */
  getCompatible(cameraModel: string): readonly AccessoryCompatEntry[] {
    const entry = this.resolveEntry(cameraModel);
    return entry?.accessories ?? [];
  }

  /**
   * Filter accessories by type (mount, power, etc.)
   */
  getByType(cameraModel: string, type: AccessoryType): readonly AccessoryCompatEntry[] {
    return this.getCompatible(cameraModel).filter((a) => a.accessoryType === type);
  }

  /**
   * Get only recommended accessories
   */
  getRecommended(cameraModel: string): readonly AccessoryCompatEntry[] {
    return this.getCompatible(cameraModel).filter(
      (a) => a.recommendation === 'recommended'
    );
  }

  /**
   * Get mounts filtered by placement type
   */
  getMountsByPlacement(
    cameraModel: string,
    placement: PlacementType
  ): readonly AccessoryCompatEntry[] {
    return this.getCompatible(cameraModel).filter(
      (a) => a.accessoryType === 'mount' && a.mountPlacement === placement
    );
  }

  /**
   * Resolve the single best mount for a camera + placement.
   * Priority: recommended > included > compatible, then prefer no-additional-required.
   */
  resolveMountPair(
    cameraModel: string,
    placement: PlacementType
  ): AccessoryCompatEntry | null {
    const mounts = this.getMountsByPlacement(cameraModel, placement);
    if (mounts.length === 0) return null;
    if (mounts.length === 1) return mounts[0] ?? null;

    // Sort by recommendation priority, then by requiresAdditional (false first)
    const sorted = [...mounts].sort((a, b) => {
      const recDiff =
        RECOMMENDATION_PRIORITY[b.recommendation] -
        RECOMMENDATION_PRIORITY[a.recommendation];
      if (recDiff !== 0) return recDiff;
      // Prefer mounts that don't require additional accessories
      if (a.requiresAdditional !== b.requiresAdditional) {
        return a.requiresAdditional ? 1 : -1;
      }
      return 0;
    });

    return sorted[0] ?? null;
  }

  /**
   * Check if any compatibility data exists for a camera model
   */
  hasCompatibility(cameraModel: string): boolean {
    return this.resolveEntry(cameraModel) !== null;
  }

  /**
   * Total number of camera models with compatibility data
   */
  get size(): number {
    return this.data.size;
  }

  // ─── Internal Resolution ────────────────────────────────────────────────

  /**
   * Resolve a camera model to its compatibility entry using
   * the three-step fallback chain:
   * 1. Exact model match
   * 2. Base model match (strip variant suffixes)
   * 3. Series match (first letter + first two digits)
   */
  private resolveEntry(
    cameraModel: string
  ): { productVariant: string; accessories: AccessoryCompatEntry[] } | null {
    const normalized = normalizeModelKey(cameraModel);

    // Step 1: Exact match
    const exact = this.data.get(normalized);
    if (exact) return exact;

    // Step 2: Base model fallback
    const base = getBaseModelKey(normalized);
    if (base !== normalized) {
      const baseEntry = this.data.get(base);
      if (baseEntry) return baseEntry;
    }

    // Step 3: Series match (e.g., "P3285-LVE" → "P32" prefix)
    const seriesPrefix = extractSeriesPrefix(normalized);
    if (seriesPrefix) {
      // Find the first model in this series that has data
      for (const [key, entry] of this.data.entries()) {
        if (key.startsWith(seriesPrefix)) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * Resolve with confidence tracking (for MountPairingResult)
   */
  resolveWithConfidence(
    cameraModel: string
  ): {
    entry: { productVariant: string; accessories: AccessoryCompatEntry[] } | null;
    confidence: 'exact' | 'series-fallback' | 'none';
    warning?: string;
  } {
    const normalized = normalizeModelKey(cameraModel);

    // Exact match
    const exact = this.data.get(normalized);
    if (exact) return { entry: exact, confidence: 'exact' };

    // Base model
    const base = getBaseModelKey(normalized);
    if (base !== normalized) {
      const baseEntry = this.data.get(base);
      if (baseEntry) return { entry: baseEntry, confidence: 'exact' };
    }

    // Series fallback
    const seriesPrefix = extractSeriesPrefix(normalized);
    if (seriesPrefix) {
      for (const [key, entry] of this.data.entries()) {
        if (key.startsWith(seriesPrefix)) {
          return {
            entry,
            confidence: 'series-fallback',
            warning: `No exact match for ${cameraModel}. Using ${key} series data.`,
          };
        }
      }
    }

    return { entry: null, confidence: 'none' };
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract series prefix: "P3285-LVE" → "P32", "M4215-LV" → "M42"
 */
function extractSeriesPrefix(model: string): string | null {
  const match = model.match(/^([A-Z]+)(\d{2})/);
  return match ? `${match[1]}${match[2]}` : null;
}

/**
 * Get default placements for a camera form factor
 */
export function getFormFactorDefaults(
  cameraType: CameraSubcategory | null
): PlacementType[] {
  if (!cameraType) return [];
  return FORM_FACTOR_DEFAULTS[cameraType] ?? [];
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let accessoryInstance: AccessoryLookup | null = null;

/**
 * Initialize accessory data (call once from App.tsx)
 */
export function initAccessoryData(data: AccessoryCompatDatabase): IAccessoryLookup {
  accessoryInstance = new AccessoryLookup(data);
  return accessoryInstance;
}

/**
 * Get the accessory lookup instance
 */
export function getAccessoryLookup(): AccessoryLookup {
  if (!accessoryInstance) {
    throw new Error('Accessory data not initialized. Call initAccessoryData() first.');
  }
  return accessoryInstance;
}
