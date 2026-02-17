/**
 * MSRP Lookup Module
 * 
 * Price lookup with intelligent fallback cascade.
 */

import type { MSRPResult, IMSRPLookup } from '@/types';
import { normalizeModelKey, getBaseModelKey } from '@/core/model/normalize';

// =============================================================================
// MSRP LOOKUP IMPLEMENTATION
// =============================================================================

export class MSRPLookup implements IMSRPLookup {
  private data: Map<string, number> = new Map();

  constructor(msrpData: Record<string, number>) {
    // Build lookup map with normalized keys
    for (const [model, price] of Object.entries(msrpData)) {
      this.data.set(normalizeModelKey(model), price);
    }
  }

  /**
   * Look up price with fallback cascade
   */
  lookup(model: string): MSRPResult {
    const normalized = normalizeModelKey(model);

    // 1. Direct match
    const directPrice = this.data.get(normalized);
    if (directPrice !== undefined) {
      return {
        price: directPrice,
        matchType: 'direct',
        matchedModel: normalized,
        formatted: this.formatPrice(directPrice),
      };
    }

    // 2. Base model (strip variants)
    const baseModel = getBaseModelKey(normalized);
    if (baseModel !== normalized) {
      const basePrice = this.data.get(baseModel);
      if (basePrice !== undefined) {
        return {
          price: basePrice,
          matchType: 'base-model',
          matchedModel: baseModel,
          formatted: this.formatPrice(basePrice),
        };
      }
    }

    // 3. First word only (aggressive fallback)
    const firstWord = normalized.split(/[-\s]/)[0];
    if (firstWord && firstWord !== normalized && firstWord !== baseModel) {
      const wordPrice = this.data.get(firstWord);
      if (wordPrice !== undefined) {
        return {
          price: wordPrice,
          matchType: 'variant',
          matchedModel: firstWord,
          formatted: this.formatPrice(wordPrice),
        };
      }
    }

    // 4. Not found
    return {
      price: null,
      matchType: 'not-found',
      formatted: 'TBD',
    };
  }

  /**
   * Get raw price or null
   */
  getPrice(model: string): number | null {
    return this.lookup(model).price;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number | null): string {
    if (price === null) return 'TBD';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Calculate total for multiple items
   */
  calculateTotal(
    items: readonly { model: string; quantity: number }[]
  ): { total: number; unknownCount: number } {
    let total = 0;
    let unknownCount = 0;

    for (const item of items) {
      const price = this.getPrice(item.model);
      if (price !== null) {
        total += price * item.quantity;
      } else {
        unknownCount += item.quantity;
      }
    }

    return { total, unknownCount };
  }

  /**
   * Check if model has known price
   */
  hasPrice(model: string): boolean {
    return this.lookup(model).price !== null;
  }

}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let msrpInstance: MSRPLookup | null = null;

/**
 * Initialize MSRP lookup (call once with data)
 */
export function initMSRP(data: Record<string, number>): IMSRPLookup {
  msrpInstance = new MSRPLookup(data);
  return msrpInstance;
}

/**
 * Get MSRP lookup instance
 */
export function getMSRP(): IMSRPLookup {
  if (!msrpInstance) {
    throw new Error('MSRP not initialized. Call initMSRP() first.');
  }
  return msrpInstance;
}

/**
 * Convenience: look up price
 */
export function lookupPrice(model: string): MSRPResult {
  return getMSRP().lookup(model);
}

/**
 * Convenience: get formatted price
 */
export function getFormattedPrice(model: string): string {
  return getMSRP().lookup(model).formatted;
}
