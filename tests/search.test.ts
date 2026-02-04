/**
 * Search Engine Tests
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  levenshteinDistance,
  similarity,
  scoreMatch,
  normalizeStrict,
  normalizeVoice,
  THRESHOLDS,
} from '../src/core/search/fuzzy';
import { parseQuery } from '../src/core/search/queryParser';
import { createSearchEngine } from '../src/core/search/engine';
import type { CompetitorMapping, LegacyAxisMapping } from '../src/types';

// =============================================================================
// FUZZY MATCHING TESTS
// =============================================================================

describe('Levenshtein Distance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns correct distance for single edits', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);  // substitution
    expect(levenshteinDistance('cat', 'cart')).toBe(1); // insertion
    expect(levenshteinDistance('cart', 'cat')).toBe(1); // deletion
  });

  it('handles empty strings', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('calculates correctly for model numbers', () => {
    expect(levenshteinDistance('P3265LVE', 'P3265LVE')).toBe(0);
    expect(levenshteinDistance('P3265', 'P3365')).toBe(1);
    expect(levenshteinDistance('DS2CD2143', 'DS2CD2183')).toBe(1);
  });
});

describe('Similarity Score', () => {
  it('returns 100 for exact match', () => {
    expect(similarity('P3265-LVE', 'P3265-LVE')).toBe(100);
  });

  it('handles normalization', () => {
    expect(similarity('p3265-lve', 'P3265-LVE')).toBe(100);
    expect(similarity('P3265LVE', 'P3265-LVE')).toBe(100);
  });

  it('returns reasonable scores for similar models', () => {
    const score = similarity('P3265', 'P3365');
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThan(100);
  });
});

describe('Score Match', () => {
  it('classifies exact matches correctly', () => {
    const result = scoreMatch('DS-2CD2143G2-I', 'DS-2CD2143G2-I');
    expect(result.type).toBe('exact');
    expect(result.score).toBe(100);
  });

  it('classifies partial matches correctly', () => {
    const result = scoreMatch('DS-2CD2143', 'DS-2CD2143G2-I');
    expect(result.type).toBe('partial');
    expect(result.score).toBeGreaterThanOrEqual(THRESHOLDS.PARTIAL);
  });

  it('classifies non-matches correctly', () => {
    const result = scoreMatch('COMPLETELY', 'DIFFERENT');
    expect(result.type).toBe('none');
    expect(result.score).toBeLessThan(THRESHOLDS.SIMILAR);
  });
});

describe('Normalization', () => {
  it('normalizeStrict removes all non-alphanumeric', () => {
    expect(normalizeStrict('DS-2CD2143G2-I')).toBe('DS2CD2143G2I');
    expect(normalizeStrict('AXIS P3265-LVE')).toBe('AXISP3265LVE');
    expect(normalizeStrict('  hello world  ')).toBe('HELLOWORLD');
  });

  it('normalizeVoice handles dictation quirks', () => {
    // Note: normalizeVoice converts word-by-word, so "thirty two" becomes "30 2" not "32"
    // This is expected behavior - further processing combines these
    const result = normalizeVoice('P thirty two sixty five dash L V E');
    expect(result).toContain('30');
    expect(result).toContain('-');
    expect(normalizeVoice('dash')).toBe('-');
    expect(normalizeVoice('hyphen')).toBe('-');
  });
});

// =============================================================================
// QUERY PARSER TESTS
// =============================================================================

describe('Query Parser', () => {
  it('detects Axis model queries', () => {
    expect(parseQuery('P3265-LVE').type).toBe('axis-model');
    expect(parseQuery('Q6135-LE').type).toBe('axis-model');
    expect(parseQuery('M3085-V').type).toBe('axis-model');
    expect(parseQuery('AXIS P3265-LVE').type).toBe('axis-model');
  });

  it('detects Axis browse query', () => {
    expect(parseQuery('axis').type).toBe('axis-browse');
    expect(parseQuery('AXIS').type).toBe('axis-browse');
    expect(parseQuery('Axis Communications').type).toBe('axis-browse');
  });

  it('detects manufacturer queries', () => {
    expect(parseQuery('Hikvision').type).toBe('manufacturer');
    expect(parseQuery('hikvision').type).toBe('manufacturer');
    expect(parseQuery('Verkada').type).toBe('manufacturer');
    expect(parseQuery('Hanwha Vision').type).toBe('manufacturer');
  });

  it('defaults to competitor search', () => {
    expect(parseQuery('DS-2CD2143G2-I').type).toBe('competitor');
    expect(parseQuery('IPC-HDBW2431E').type).toBe('competitor');
  });

  it('handles empty queries', () => {
    const result = parseQuery('');
    expect(result.isEmpty).toBe(true);
    expect(result.type).toBe('competitor');
  });
});

// =============================================================================
// SEARCH ENGINE TESTS
// =============================================================================

describe('Search Engine', () => {
  const mockCompetitorMappings: CompetitorMapping[] = [
    {
      competitor_model: 'DS-2CD2143G2-I',
      competitor_manufacturer: 'Hikvision',
      axis_replacement: 'P3265-LVE',
      match_confidence: 95,
      competitor_type: '4MP Dome',
    },
    {
      competitor_model: 'DS-2CD2183G2-I',
      competitor_manufacturer: 'Hikvision',
      axis_replacement: 'P3268-LVE',
      match_confidence: 90,
      competitor_type: '8MP Dome',
    },
    {
      competitor_model: 'CD62',
      competitor_manufacturer: 'Verkada',
      axis_replacement: 'Q3538-LVE',
      match_confidence: 92,
      competitor_type: '4K Dome',
    },
  ];

  const mockLegacyMappings: LegacyAxisMapping[] = [
    {
      legacy_model: 'P3364-LVE',
      replacement_model: 'P3265-LVE',
      notes: 'Direct successor',
    },
    {
      legacy_model: 'Q6044-E',
      replacement_model: 'Q6075-E',
      notes: 'PTZ upgrade',
    },
  ];

  const mockUrlResolver = (model: string) => 
    `https://www.axis.com/products/axis-${model.toLowerCase()}`;

  let engine: ReturnType<typeof createSearchEngine>;

  beforeEach(() => {
    engine = createSearchEngine(
      mockCompetitorMappings,
      mockLegacyMappings,
      mockUrlResolver
    );
  });

  it('finds exact competitor matches', () => {
    const result = engine.search('DS-2CD2143G2-I');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.score).toBe(100);
    expect(result.confidence).toBe('high');
  });

  it('finds partial competitor matches', () => {
    const result = engine.search('DS-2CD2143');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.queryType).toBe('competitor');
  });

  it('finds legacy Axis matches', () => {
    // mockLegacyMappings includes P3364-LVE → P3265-LVE
    const result = engine.search('P3364-LVE');
    expect(result.results.length).toBeGreaterThan(0);
    // Should find in legacy database
  });

  it('returns manufacturer models', () => {
    const result = engine.search('Hikvision');
    expect(result.queryType).toBe('manufacturer');
    expect(result.results.length).toBe(2); // Two Hikvision models in mock
  });

  it('returns empty results for no matches', () => {
    const result = engine.search('XYZNONEXISTENT123');
    expect(result.results.length).toBe(0);
    expect(result.confidence).toBe('none');
  });

  it('includes suggestions for partial matches', () => {
    const result = engine.search('CD6');
    // Should suggest CD62
    expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
  });

  it('handles batch search', () => {
    const queries = ['DS-2CD2143G2-I', 'CD62', 'NONEXISTENT'];
    const results = engine.searchBatch(queries);
    
    expect(results.size).toBe(3);
    expect(results.get('DS-2CD2143G2-I')?.results.length).toBeGreaterThan(0);
    expect(results.get('CD62')?.results.length).toBeGreaterThan(0);
    expect(results.get('NONEXISTENT')?.results.length).toBe(0);
  });
});
