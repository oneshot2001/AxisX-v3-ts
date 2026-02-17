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
import { normalizeModelKey, getBaseModelKey } from '@/core/model/normalize';

// =============================================================================
// CONSTANTS
// =============================================================================

const AXIS_PRODUCT_BASE = 'https://www.axis.com/products/axis-';
const AXIS_SEARCH_BASE = 'https://www.axis.com/en-us/products?q=';

// =============================================================================
// URL RESOLVER IMPLEMENTATION
// =============================================================================

export class URLResolver implements IURLResolver {
  private verifiedUrls: Map<string, string>;
  private aliases: Map<string, string>;
  private discontinued: Set<string>;

  constructor() {
    this.verifiedUrls = new Map(
      Object.entries(VERIFIED_URLS).map(([model, url]) => [normalizeModelKey(model), url])
    );
    this.aliases = new Map(
      Object.entries(MODEL_ALIASES)
        .map(([from, to]) => [normalizeModelKey(from), normalizeModelKey(to)] as const)
        .filter(([from, to]) => from !== to)
    );
    this.discontinued = new Set(DISCONTINUED_MODELS.map((model) => normalizeModelKey(model)));
  }

  /**
   * Resolve model to URL
   */
  resolve(model: string): ResolvedURL {
    const normalized = normalizeModelKey(model);

    // 1. Check aliases first (handle common typos)
    const aliasedModel = this.aliases.get(normalized);
    if (aliasedModel) {
      const aliasUrl = this.verifiedUrls.get(normalizeModelKey(aliasedModel));
      if (aliasUrl) {
        return {
          url: aliasUrl,
          confidence: 'alias',
          isDiscontinued: this.discontinued.has(normalizeModelKey(aliasedModel)),
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
    const baseModel = getBaseModelKey(normalized);
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
    const normalized = normalizeModelKey(model);
    return this.verifiedUrls.has(normalized) ||
           this.verifiedUrls.has(getBaseModelKey(normalized));
  }

  /**
   * Check if model is discontinued
   */
  isDiscontinued(model: string): boolean {
    const normalized = normalizeModelKey(model);
    return this.discontinued.has(normalized) ||
           this.discontinued.has(getBaseModelKey(normalized));
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
    this.verifiedUrls.set(normalizeModelKey(model), url);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

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
