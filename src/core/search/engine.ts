/**
 * Search Engine
 * 
 * The heart of AxisX. This orchestrates all search functionality:
 * - Competitor model search
 * - Legacy Axis upgrade paths
 * - Direct Axis model lookup
 * - Manufacturer browse
 * - Batch processing
 * 
 * All methods return typed results. No undefined, no surprises.
 */

import type {
  CompetitorMapping,
  LegacyAxisMapping,
  SearchResult,
  GroupedResults,
  SearchResponse,
  SearchConfig,
  ISearchEngine,
  QueryType,
  CategoryId,
  AxisModelInfo,
} from '@/types';

import { scoreMatch, sortByScore, THRESHOLDS, normalizeStrict } from './fuzzy';
import { parseQuery, parseBatchInput, ParsedQuery } from './queryParser';

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 10,
  minScore: THRESHOLDS.SIMILAR,
  fuzzyEnabled: true,
  suggestionsEnabled: true,
  maxSuggestions: 3,
};

// =============================================================================
// CATEGORY DETECTION
// =============================================================================

const CATEGORY_MAP: Record<string, CategoryId> = {
  'hikvision': 'ndaa',
  'dahua': 'ndaa',
  'uniview': 'ndaa',
  'verkada': 'cloud',
  'rhombus': 'cloud',
  'hanwha vision': 'korean',
  'hanwha': 'korean',
  'samsung': 'korean',
  'i-pro': 'japanese',
  'panasonic': 'japanese',
  'avigilon': 'motorola',
  'pelco': 'motorola',
  'vivotek': 'taiwan',
  'bosch': 'competitive',
  'sony': 'competitive',
  'canon': 'family',
  '2n': 'family',
  'arecont vision': 'defunct',
  'axis': 'legacy-axis',
};

function getCategory(manufacturer: string): CategoryId {
  const lower = manufacturer.toLowerCase();
  return CATEGORY_MAP[lower] ?? 'competitive';
}

// =============================================================================
// SEARCH ENGINE IMPLEMENTATION
// =============================================================================

export class SearchEngine implements ISearchEngine {
  private competitorMappings: CompetitorMapping[] = [];
  private legacyMappings: LegacyAxisMapping[] = [];
  private config: SearchConfig = DEFAULT_CONFIG;

  // Indexes for fast lookup
  private competitorIndex: Map<string, CompetitorMapping[]> = new Map();
  private legacyIndex: Map<string, LegacyAxisMapping[]> = new Map();
  private manufacturerIndex: Map<string, CompetitorMapping[]> = new Map();
  private axisModelIndex: Map<string, CompetitorMapping[]> = new Map();

  constructor(
    competitorMappings: CompetitorMapping[],
    legacyMappings: LegacyAxisMapping[],
    private urlResolver: (model: string) => string
  ) {
    this.competitorMappings = competitorMappings;
    this.legacyMappings = legacyMappings;
    this.buildIndexes();
  }

  /**
   * Build search indexes for fast lookup
   */
  private buildIndexes(): void {
    // Competitor model index (normalized)
    for (const mapping of this.competitorMappings) {
      const key = normalizeStrict(mapping.competitor_model);
      const existing = this.competitorIndex.get(key) ?? [];
      this.competitorIndex.set(key, [...existing, mapping]);

      // Manufacturer index
      const mfrKey = mapping.competitor_manufacturer.toLowerCase();
      const mfrExisting = this.manufacturerIndex.get(mfrKey) ?? [];
      this.manufacturerIndex.set(mfrKey, [...mfrExisting, mapping]);

      // Axis model index (reverse lookup)
      const axisKey = normalizeStrict(mapping.axis_replacement);
      const axisExisting = this.axisModelIndex.get(axisKey) ?? [];
      this.axisModelIndex.set(axisKey, [...axisExisting, mapping]);
    }

    // Legacy model index
    for (const mapping of this.legacyMappings) {
      const key = normalizeStrict(mapping.legacy_model);
      const existing = this.legacyIndex.get(key) ?? [];
      this.legacyIndex.set(key, [...existing, mapping]);
    }
  }

  /**
   * Main search - handles all query types automatically
   */
  search(query: string): SearchResponse {
    const startTime = performance.now();
    const parsed = parseQuery(query);

    // Empty query
    if (parsed.isEmpty) {
      return this.emptyResponse(query, startTime);
    }

    // Route based on query type
    let results: SearchResult[];
    switch (parsed.type) {
      case 'axis-browse':
        results = this.handleAxisBrowse();
        break;
      case 'axis-model':
        results = this.handleAxisModel(parsed.normalized);
        break;
      case 'manufacturer':
        results = this.handleManufacturer(parsed.manufacturer!);
        break;
      case 'legacy':
        results = this.searchLegacy(parsed.normalized);
        break;
      case 'competitor':
      default:
        results = this.searchCompetitor(parsed.normalized);
        // If no competitor results, try legacy
        if (results.length === 0) {
          const legacyResults = this.searchLegacy(parsed.normalized);
          if (legacyResults.length > 0) {
            results = legacyResults;
          }
        }
    }

    // Generate suggestions if few/no results
    const suggestions = this.config.suggestionsEnabled && results.length < 3
      ? this.getSuggestions(parsed.normalized)
      : [];

    return this.buildResponse(query, parsed.type, results, suggestions, startTime);
  }

  /**
   * Search competitor database
   */
  searchCompetitor(query: string): SearchResult[] {
    const normalizedQuery = normalizeStrict(query);
    const results: SearchResult[] = [];

    // Check exact match first (fast path)
    const exactMatches = this.competitorIndex.get(normalizedQuery);
    if (exactMatches) {
      for (const mapping of exactMatches) {
        results.push(this.createResult(mapping, 100, 'exact'));
      }
    }

    // Fuzzy search if enabled
    if (this.config.fuzzyEnabled) {
      for (const mapping of this.competitorMappings) {
        const match = scoreMatch(query, mapping.competitor_model);

        if (match.score >= this.config.minScore && match.type !== 'none') {
          // Skip if we already have this as exact match
          const isDupe = results.some(r =>
            !r.isLegacy &&
            (r.mapping as CompetitorMapping).competitor_model === mapping.competitor_model
          );

          if (!isDupe) {
            results.push(this.createResult(mapping, match.score, match.type));
          }
        }
      }
    }

    return sortByScore(results).slice(0, this.config.maxResults);
  }

  /**
   * Search legacy Axis database
   */
  searchLegacy(query: string): SearchResult[] {
    const normalizedQuery = normalizeStrict(query);
    const results: SearchResult[] = [];

    // Exact match first
    const exactMatches = this.legacyIndex.get(normalizedQuery);
    if (exactMatches) {
      for (const mapping of exactMatches) {
        results.push(this.createLegacyResult(mapping, 100, 'exact'));
      }
    }

    // Fuzzy search
    if (this.config.fuzzyEnabled) {
      for (const mapping of this.legacyMappings) {
        const match = scoreMatch(query, mapping.legacy_model);

        if (match.score >= this.config.minScore && match.type !== 'none') {
          const isDupe = results.some(r =>
            r.isLegacy &&
            (r.mapping as LegacyAxisMapping).legacy_model === mapping.legacy_model
          );

          if (!isDupe) {
            results.push(this.createLegacyResult(mapping, match.score, match.type));
          }
        }
      }
    }

    return sortByScore(results).slice(0, this.config.maxResults);
  }

  /**
   * Lookup Axis model info (reverse lookup)
   */
  lookupAxisModel(model: string): AxisModelInfo | null {
    const normalized = normalizeStrict(model);
    const competitors = this.axisModelIndex.get(normalized);

    if (!competitors || competitors.length === 0) {
      return null;
    }

    // Get unique features from all mappings
    const features = new Set<string>();
    for (const c of competitors) {
      if (c.axis_features) {
        for (const f of c.axis_features) {
          features.add(f);
        }
      }
    }

    const firstMapping = competitors[0]!;
    const cleanModel = model.toUpperCase().replace(/^AXIS\s*/i, '');

    return {
      model: cleanModel,
      series: cleanModel.charAt(0) as 'P' | 'Q' | 'M' | 'F' | 'T' | 'V' | 'W' | 'D' | 'C' | 'A',
      formFactor: this.inferFormFactor(cleanModel),
      resolution: this.inferResolution(cleanModel),
      features: Array.from(features) as any,
      msrp: null, // Filled by MSRP lookup
      url: this.urlResolver(cleanModel),
      isDiscontinued: false,
    };
  }

  /**
   * Get all models for a manufacturer
   */
  getManufacturerModels(manufacturer: string): CompetitorMapping[] {
    const key = manufacturer.toLowerCase();
    return this.manufacturerIndex.get(key) ?? [];
  }

  /**
   * Batch search
   */
  searchBatch(queries: readonly string[]): Map<string, SearchResponse> {
    const results = new Map<string, SearchResponse>();

    for (const query of queries) {
      results.set(query, this.search(query));
    }

    return results;
  }

  /**
   * Get search suggestions for partial input
   */
  getSuggestions(partial: string): string[] {
    if (partial.length < 2) return [];

    const suggestions: Array<{ model: string; score: number }> = [];
    const normalizedPartial = normalizeStrict(partial);

    // Check competitor models
    for (const mapping of this.competitorMappings) {
      const normalized = normalizeStrict(mapping.competitor_model);
      if (normalized.startsWith(normalizedPartial) || normalized.includes(normalizedPartial)) {
        suggestions.push({
          model: mapping.competitor_model,
          score: normalized.startsWith(normalizedPartial) ? 100 : 50,
        });
      }
    }

    // Sort by score and deduplicate
    return [...new Set(
      suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxSuggestions)
        .map(s => s.model)
    )];
  }

  /**
   * Update configuration
   */
  configure(config: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private handleAxisBrowse(): SearchResult[] {
    // Return a sample from each manufacturer for browse mode
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    for (const mapping of this.competitorMappings) {
      const mfr = mapping.competitor_manufacturer;
      if (!seen.has(mfr)) {
        seen.add(mfr);
        results.push(this.createResult(mapping, 100, 'exact'));
      }
    }

    return results.slice(0, 20);
  }

  private handleAxisModel(model: string): SearchResult[] {
    const normalized = normalizeStrict(model);
    const competitors = this.axisModelIndex.get(normalized) ?? [];

    return competitors.map(mapping =>
      this.createResult(mapping, 100, 'exact')
    );
  }

  private handleManufacturer(manufacturer: string): SearchResult[] {
    const mappings = this.getManufacturerModels(manufacturer);

    return mappings
      .slice(0, this.config.maxResults)
      .map(mapping => this.createResult(mapping, 100, 'exact'));
  }

  private createResult(
    mapping: CompetitorMapping,
    score: number,
    type: 'exact' | 'partial' | 'similar' | 'none'
  ): SearchResult {
    return {
      score,
      type,
      mapping,
      isLegacy: false,
      axisUrl: this.urlResolver(mapping.axis_replacement),
      category: getCategory(mapping.competitor_manufacturer),
    };
  }

  private createLegacyResult(
    mapping: LegacyAxisMapping,
    score: number,
    type: 'exact' | 'partial' | 'similar' | 'none'
  ): SearchResult {
    return {
      score,
      type,
      mapping,
      isLegacy: true,
      axisUrl: this.urlResolver(mapping.replacement_model),
      category: 'legacy-axis',
    };
  }

  private emptyResponse(query: string, startTime: number): SearchResponse {
    return {
      query,
      queryType: 'competitor',
      results: [],
      grouped: { exact: [], partial: [], similar: [] },
      suggestions: [],
      confidence: 'none',
      durationMs: performance.now() - startTime,
      isBatch: false,
    };
  }

  private buildResponse(
    query: string,
    queryType: QueryType,
    results: SearchResult[],
    suggestions: string[],
    startTime: number
  ): SearchResponse {
    // Group results
    const grouped: GroupedResults = {
      exact: results.filter(r => r.type === 'exact'),
      partial: results.filter(r => r.type === 'partial'),
      similar: results.filter(r => r.type === 'similar'),
    };

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' | 'none';
    if (grouped.exact.length > 0) {
      confidence = 'high';
    } else if (grouped.partial.length > 0) {
      confidence = 'medium';
    } else if (grouped.similar.length > 0) {
      confidence = 'low';
    } else {
      confidence = 'none';
    }

    return {
      query,
      queryType,
      results,
      grouped,
      suggestions,
      confidence,
      durationMs: performance.now() - startTime,
      isBatch: false,
    };
  }

  private inferFormFactor(model: string): 'fixed-dome' | 'bullet' | 'ptz' | 'box' | 'panoramic' | 'specialty' {
    const series = model.charAt(0);
    const digit = parseInt(model.charAt(1), 10);

    if (series === 'F') return 'box'; // Modular
    if (series === 'T') return 'specialty'; // Thermal

    if (['P', 'Q', 'M'].includes(series)) {
      if (digit === 1) return 'box';
      if (digit === 2) return 'bullet';
      if (digit === 3 || digit === 4) return 'fixed-dome';
      if (digit === 5 || digit === 6) return 'ptz';
      if (digit === 7) return 'panoramic';
    }

    return 'fixed-dome';
  }

  private inferResolution(model: string): '1080p' | '4K' | '4MP' | '5MP' {
    // Could be enhanced with a lookup table
    if (model.includes('4K') || model.includes('8MP')) return '4K';
    if (model.includes('5MP')) return '5MP';
    if (model.includes('4MP')) return '4MP';
    return '1080p';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a search engine instance
 */
export function createSearchEngine(
  competitorMappings: CompetitorMapping[],
  legacyMappings: LegacyAxisMapping[],
  urlResolver: (model: string) => string
): ISearchEngine {
  return new SearchEngine(competitorMappings, legacyMappings, urlResolver);
}
