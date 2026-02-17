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
import { parseQuery } from './queryParser';

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

function addToIndex<K, V>(index: Map<K, V[]>, key: K, value: V): void {
  const existing = index.get(key);
  if (existing) {
    existing.push(value);
  } else {
    index.set(key, [value]);
  }
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
  private typeIndex: Map<string, CompetitorMapping[]> = new Map();

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
      addToIndex(this.competitorIndex, key, mapping);

      // Manufacturer index
      const mfrKey = mapping.competitor_manufacturer.toLowerCase();
      addToIndex(this.manufacturerIndex, mfrKey, mapping);

      // Axis model index (reverse lookup)
      const axisKey = normalizeStrict(mapping.axis_replacement);
      addToIndex(this.axisModelIndex, axisKey, mapping);

      // Type index (camera type grouping)
      if (mapping.competitor_type) {
        const typeKey = this.normalizeType(mapping.competitor_type);
        addToIndex(this.typeIndex, typeKey, mapping);
      }
    }

    // Legacy model index
    for (const mapping of this.legacyMappings) {
      const key = normalizeStrict(mapping.legacy_model);
      addToIndex(this.legacyIndex, key, mapping);
    }
  }

  /**
   * Normalize camera type for consistent grouping
   */
  private normalizeType(type: string): string {
    const lower = type.toLowerCase();

    // Dome variants
    if (lower.includes('dome')) {
      if (lower.includes('ptz')) return 'ptz-dome';
      if (lower.includes('mini') || lower.includes('compact')) return 'compact-dome';
      if (lower.includes('outdoor')) return 'outdoor-dome';
      if (lower.includes('indoor')) return 'indoor-dome';
      return 'dome';
    }

    // Bullet variants
    if (lower.includes('bullet')) return 'bullet';

    // PTZ variants
    if (lower.includes('ptz') || lower.includes('speed')) return 'ptz';

    // Box cameras
    if (lower.includes('box') || lower.includes('fixed')) return 'box';

    // Panoramic / Multi-sensor
    if (lower.includes('panoramic') || lower.includes('multi') || lower.includes('180') || lower.includes('360')) {
      return 'panoramic';
    }

    // Thermal
    if (lower.includes('thermal')) return 'thermal';

    // Default to the original
    return lower;
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
    const seenModels = new Set<string>();

    // Check exact match first (fast path)
    const exactMatches = this.competitorIndex.get(normalizedQuery);
    if (exactMatches) {
      for (const mapping of exactMatches) {
        results.push(this.createResult(mapping, 100, 'exact'));
        seenModels.add(normalizeStrict(mapping.competitor_model));
      }
    }

    // Fuzzy search if enabled
    if (this.config.fuzzyEnabled) {
      for (const mapping of this.competitorMappings) {
        const modelKey = normalizeStrict(mapping.competitor_model);
        if (seenModels.has(modelKey)) {
          continue;
        }

        const match = scoreMatch(query, mapping.competitor_model);

        if (match.score >= this.config.minScore && match.type !== 'none') {
          results.push(this.createResult(mapping, match.score, match.type));
          seenModels.add(modelKey);
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
    const seenModels = new Set<string>();

    // Exact match first
    const exactMatches = this.legacyIndex.get(normalizedQuery);
    if (exactMatches) {
      for (const mapping of exactMatches) {
        results.push(this.createLegacyResult(mapping, 100, 'exact'));
        seenModels.add(normalizeStrict(mapping.legacy_model));
      }
    }

    // Fuzzy search
    if (this.config.fuzzyEnabled) {
      for (const mapping of this.legacyMappings) {
        const modelKey = normalizeStrict(mapping.legacy_model);
        if (seenModels.has(modelKey)) {
          continue;
        }

        const match = scoreMatch(query, mapping.legacy_model);

        if (match.score >= this.config.minScore && match.type !== 'none') {
          results.push(this.createLegacyResult(mapping, match.score, match.type));
          seenModels.add(modelKey);
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

    const suggestions = new Map<string, number>();
    const normalizedPartial = normalizeStrict(partial);

    // Check competitor models
    for (const mapping of this.competitorMappings) {
      const normalized = normalizeStrict(mapping.competitor_model);
      if (normalized.startsWith(normalizedPartial) || normalized.includes(normalizedPartial)) {
        const score = normalized.startsWith(normalizedPartial) ? 100 : 50;
        const existingScore = suggestions.get(mapping.competitor_model) ?? 0;
        if (score > existingScore) {
          suggestions.set(mapping.competitor_model, score);
        }
      }
    }

    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.maxSuggestions)
      .map(([model]) => model);
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
    // Browse mode — UI renders from static catalog data (axisCatalog.ts)
    // Return empty results; queryType 'axis-browse' triggers AxisBrowseResults component
    return [];
  }

  private handleAxisModel(model: string): SearchResult[] {
    const normalized = normalizeStrict(model);
    const competitors = this.axisModelIndex.get(normalized) ?? [];

    // If no competitor mappings found, check if it's a legacy Axis model
    if (competitors.length === 0) {
      const legacyResults = this.searchLegacy(model);
      if (legacyResults.length > 0) {
        return legacyResults;
      }
    }

    return competitors.map(mapping =>
      this.createResult(mapping, 100, 'exact')
    );
  }

  private handleManufacturer(manufacturer: string): SearchResult[] {
    const mappings = this.getManufacturerModels(manufacturer);

    // Return ALL models for the manufacturer, grouped by camera type
    // Sort by camera type for better organization
    const sortedMappings = [...mappings].sort((a, b) => {
      const typeA = a.competitor_type?.toLowerCase() ?? '';
      const typeB = b.competitor_type?.toLowerCase() ?? '';
      return typeA.localeCompare(typeB);
    });

    return sortedMappings.map(mapping => this.createResult(mapping, 100, 'exact'));
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
    // Group results in one pass.
    const exact: SearchResult[] = [];
    const partial: SearchResult[] = [];
    const similar: SearchResult[] = [];
    for (const result of results) {
      if (result.type === 'exact') {
        exact.push(result);
      } else if (result.type === 'partial') {
        partial.push(result);
      } else if (result.type === 'similar') {
        similar.push(result);
      }
    }
    const grouped: GroupedResults = { exact, partial, similar };

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
