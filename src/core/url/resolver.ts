/**
 * URL Resolver
 * 
 * Resolves Axis model numbers to axis.com product page URLs.
 * Uses a verified URL table for 100% accuracy on known models.
 * 
 * Resolution cascade:
 * 1. Verified URL table (hardcoded known-good)
 * 2. Model aliases (common typos → correct model)
 * 3. Generated URL (pattern-based)
 * 4. Search fallback (axis.com/products?q=)
 */

import type { ResolvedURL, IURLResolver } from '@/types';
import { VERIFIED_URLS } from './verified';
import { MODEL_ALIASES, DISCONTINUED_MODELS } from './aliases';

// =============================================================================
// CONSTANTS
// =============================================================================

const AXIS_PRODUCT_BASE = 'https://www.axis.com/products/axis-';
const AXIS_SEARCH_BASE = 'https://www.axis.com/en-us/products?q=';

/**
 * Variant suffixes to strip when generating URLs
 */
const VARIANT_SUFFIXES = [
  // Frequency variants
  '-60HZ', '-50HZ', '60HZ', '50HZ',
  // Regional variants
  '-EUR', '-US', '-BR', '-NM', '-AR',
  'EUR', 'US', 'BR', 'NM', 'AR',
  // Hardware variants
  '-24V', '-M12', '-ZOOM', '24V', 'M12',
  // Bundle variants
  '-BULK', 'BULK',
  // Generation markers (keep MK II in URL)
] as const;

/**
 * Lens size pattern (e.g., -35MM, -8MM)
 */
const LENS_PATTERN = /-?\d+MM$/i;

// =============================================================================
// URL RESOLVER IMPLEMENTATION
// =============================================================================

export class URLResolver implements IURLResolver {
  private verifiedUrls: Map<string, string>;
  private aliases: Map<string, string>;
  private discontinued: Set<string>;

  constructor() {
    this.verifiedUrls = new Map(Object.entries(VERIFIED_URLS));
    this.aliases = new Map(Object.entries(MODEL_ALIASES));
    this.discontinued = new Set(DISCONTINUED_MODELS);
  }

  /**
   * Resolve model to URL
   */
  resolve(model: string): ResolvedURL {
    const normalized = this.normalize(model);

    // 1. Check aliases first (handle common typos)
    const aliasedModel = this.aliases.get(normalized);
    if (aliasedModel) {
      const aliasUrl = this.verifiedUrls.get(this.normalize(aliasedModel));
      if (aliasUrl) {
        return {
          url: aliasUrl,
          confidence: 'alias',
          isDiscontinued: this.discontinued.has(aliasedModel),
          resolvedModel: aliasedModel,
          warning: `Redirected from ${model} to ${aliasedModel}`,
        };
      }
    }

    // 2. Check verified URLs (exact match)
    const verifiedUrl = this.verifiedUrls.get(normalized);
    if (verifiedUrl) {
      return {
        url: verifiedUrl,
        confidence: 'verified',
        isDiscontinued: this.discontinued.has(normalized),
        resolvedModel: normalized,
      };
    }

    // 3. Try base model (strip variants)
    const baseModel = this.getBaseModel(normalized);
    if (baseModel !== normalized) {
      const baseUrl = this.verifiedUrls.get(baseModel);
      if (baseUrl) {
        return {
          url: baseUrl,
          confidence: 'verified',
          isDiscontinued: this.discontinued.has(baseModel),
          resolvedModel: baseModel,
        };
      }
    }

    // 4. Check if discontinued (use search fallback)
    if (this.discontinued.has(normalized) || this.discontinued.has(baseModel)) {
      return {
        url: this.buildSearchUrl(normalized),
        confidence: 'search-fallback',
        isDiscontinued: true,
        resolvedModel: normalized,
        warning: 'This model is discontinued',
      };
    }

    // 5. Generate URL from pattern
    const generatedUrl = this.buildProductUrl(baseModel);
    return {
      url: generatedUrl,
      confidence: 'generated',
      isDiscontinued: false,
      resolvedModel: baseModel,
    };
  }

  /**
   * Check if model has verified URL
   */
  isVerified(model: string): boolean {
    const normalized = this.normalize(model);
    return this.verifiedUrls.has(normalized) ||
           this.verifiedUrls.has(this.getBaseModel(normalized));
  }

  /**
   * Check if model is discontinued
   */
  isDiscontinued(model: string): boolean {
    const normalized = this.normalize(model);
    return this.discontinued.has(normalized) ||
           this.discontinued.has(this.getBaseModel(normalized));
  }

  /**
   * Get all verified URLs
   */
  getVerifiedUrls(): ReadonlyMap<string, string> {
    return this.verifiedUrls;
  }

  /**
   * Add verified URL at runtime
   */
  addVerifiedUrl(model: string, url: string): void {
    this.verifiedUrls.set(this.normalize(model), url);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Normalize model string for lookup
   */
  private normalize(model: string): string {
    return model
      .toUpperCase()
      .replace(/^AXIS\s*/i, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Get base model by stripping variant suffixes
   */
  private getBaseModel(model: string): string {
    let base = model;

    // Remove known variant suffixes
    for (const suffix of VARIANT_SUFFIXES) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length);
      }
    }

    // Remove lens size suffix
    base = base.replace(LENS_PATTERN, '');

    // Clean up trailing hyphens
    base = base.replace(/-+$/, '');

    return base;
  }

  /**
   * Build product page URL
   */
  private buildProductUrl(model: string): string {
    const slug = model.toLowerCase().replace(/\s+/g, '-');
    return `${AXIS_PRODUCT_BASE}${slug}`;
  }

  /**
   * Build search fallback URL
   */
  private buildSearchUrl(model: string): string {
    return `${AXIS_SEARCH_BASE}${encodeURIComponent(model)}`;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let resolverInstance: URLResolver | null = null;

/**
 * Get URL resolver instance (singleton)
 */
export function getURLResolver(): IURLResolver {
  if (!resolverInstance) {
    resolverInstance = new URLResolver();
  }
  return resolverInstance;
}

/**
 * Convenience function - resolve model to URL
 */
export function resolveURL(model: string): ResolvedURL {
  return getURLResolver().resolve(model);
}

/**
 * Convenience function - get URL string only
 */
export function getAxisURL(model: string): string {
  return getURLResolver().resolve(model).url;
}
