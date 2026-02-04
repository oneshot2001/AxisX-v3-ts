/**
 * Fuzzy Matching Algorithms
 * 
 * Pure functions for string matching and scoring.
 * No side effects, easily testable.
 */

import type { MatchType } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Score thresholds for match classification */
export const THRESHOLDS = {
  EXACT: 90,
  PARTIAL: 70,
  SIMILAR: 50,
} as const;

// =============================================================================
// STRING NORMALIZATION
// =============================================================================

/**
 * Normalize for exact matching - strips ALL non-alphanumeric
 * 
 * @example
 * normalizeStrict("DS-2CD2143G2-I") → "DS2CD2143G2I"
 * normalizeStrict("AXIS P3265-LVE") → "AXISP3265LVE"
 */
export function normalizeStrict(str: string): string {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Normalize for display - preserves structure but normalizes case
 * 
 * @example
 * normalizeDisplay("axis p3265-lve") → "P3265-LVE"
 * normalizeDisplay("  DS-2CD2143G2-I  ") → "DS-2CD2143G2-I"
 */
export function normalizeDisplay(str: string): string {
  return str
    .toUpperCase()
    .replace(/^AXIS\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize voice input - handles common dictation quirks
 * 
 * @example
 * normalizeVoice("P thirty two sixty five dash L V E") → "P3265-LVE"
 * normalizeVoice("hikvision dash two CD") → "HIKVISION-2CD"
 */
export function normalizeVoice(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    // Number words to digits
    .replace(/\bone\b/gi, '1')
    .replace(/\btwo\b/gi, '2')
    .replace(/\bthree\b/gi, '3')
    .replace(/\bfour\b/gi, '4')
    .replace(/\bfive\b/gi, '5')
    .replace(/\bsix\b/gi, '6')
    .replace(/\bseven\b/gi, '7')
    .replace(/\beight\b/gi, '8')
    .replace(/\bnine\b/gi, '9')
    .replace(/\bzero\b/gi, '0')
    .replace(/\bten\b/gi, '10')
    .replace(/\btwenty\b/gi, '20')
    .replace(/\bthirty\b/gi, '30')
    .replace(/\bforty\b/gi, '40')
    .replace(/\bfifty\b/gi, '50')
    .replace(/\bsixty\b/gi, '60')
    .replace(/\bseventy\b/gi, '70')
    .replace(/\beighty\b/gi, '80')
    .replace(/\bninety\b/gi, '90')
    .replace(/\bhundred\b/gi, '00')
    // Punctuation words
    .replace(/\bdash\b/gi, '-')
    .replace(/\bhyphen\b/gi, '-')
    .replace(/\bperiod\b/gi, '.')
    .replace(/\bdot\b/gi, '.')
    // Clean up spaces around punctuation
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*\.\s*/g, '.')
    .toUpperCase();
}

// =============================================================================
// LEVENSHTEIN DISTANCE
// =============================================================================

/**
 * Calculate Levenshtein (edit) distance between two strings.
 * 
 * This is the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change one string into another.
 * 
 * @example
 * levenshteinDistance("kitten", "sitting") → 3
 * levenshteinDistance("P3265", "P3365") → 1
 */
export function levenshteinDistance(a: string, b: string): number {
  // Edge cases
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Use two-row optimization instead of full matrix (O(min(m,n)) space)
  const aLen = a.length;
  const bLen = b.length;

  // Ensure a is the shorter string for space efficiency
  if (aLen > bLen) {
    [a, b] = [b, a];
  }

  let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i);
  let currRow = new Array<number>(a.length + 1);

  for (let j = 1; j <= b.length; j++) {
    currRow[0] = j;

    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[i] = Math.min(
        currRow[i - 1]! + 1,      // Insertion
        prevRow[i]! + 1,          // Deletion
        prevRow[i - 1]! + cost    // Substitution
      );
    }

    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[a.length]!;
}

/**
 * Calculate similarity score (0-100) based on Levenshtein distance.
 * 
 * @example
 * similarity("P3265-LVE", "P3265-LVE") → 100
 * similarity("P3265", "P3365") → 80 (1 edit in 5 chars)
 */
export function similarity(a: string, b: string): number {
  const normA = normalizeStrict(a);
  const normB = normalizeStrict(b);

  if (normA === normB) return 100;
  if (normA.length === 0 || normB.length === 0) return 0;

  const distance = levenshteinDistance(normA, normB);
  const maxLength = Math.max(normA.length, normB.length);

  return Math.round((1 - distance / maxLength) * 100);
}

// =============================================================================
// MATCH SCORING
// =============================================================================

/** Match result with score and type */
export interface MatchScore {
  readonly score: number;
  readonly type: MatchType;
  readonly isSubstring: boolean;
}

/**
 * Score a query against a target string.
 * Returns score (0-100) and match type classification.
 * 
 * @example
 * scoreMatch("DS-2CD2143", "DS-2CD2143G2-I") → { score: 95, type: 'exact', isSubstring: true }
 * scoreMatch("P3265", "P3365") → { score: 80, type: 'partial', isSubstring: false }
 */
export function scoreMatch(query: string, target: string): MatchScore {
  const normQuery = normalizeStrict(query);
  const normTarget = normalizeStrict(target);

  // Perfect match
  if (normQuery === normTarget) {
    return { score: 100, type: 'exact', isSubstring: false };
  }

  // Check substring match
  const isSubstring =
    normTarget.includes(normQuery) || normQuery.includes(normTarget);

  // Calculate base similarity
  let score = similarity(query, target);

  // Boost substring matches
  if (isSubstring) {
    // Bonus based on how much of the target is covered
    const coverage = Math.min(normQuery.length, normTarget.length) /
                     Math.max(normQuery.length, normTarget.length);
    score = Math.max(score, Math.round(THRESHOLDS.PARTIAL + (coverage * 20)));
  }

  // Classify match type
  let type: MatchType;
  if (score >= THRESHOLDS.EXACT) {
    type = 'exact';
  } else if (score >= THRESHOLDS.PARTIAL) {
    type = 'partial';
  } else if (score >= THRESHOLDS.SIMILAR) {
    type = 'similar';
  } else {
    type = 'none';
  }

  return { score, type, isSubstring };
}

/**
 * Check if a match passes minimum threshold
 */
export function isValidMatch(score: MatchScore): boolean {
  return score.type !== 'none';
}

// =============================================================================
// WORD-BASED MATCHING
// =============================================================================

/**
 * Tokenize string into words
 */
export function tokenize(str: string): string[] {
  return str
    .toUpperCase()
    .split(/[\s\-_./]+/)
    .filter(token => token.length > 0);
}

/**
 * Calculate word overlap score
 * Useful for manufacturer name matching
 * 
 * @example
 * wordOverlap("Hanwha Vision", "Hanwha") → 0.5 (1 of 2 words)
 * wordOverlap("i-PRO", "iPRO") → would need fuzzy per-word
 */
export function wordOverlap(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let matches = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      matches++;
    }
  }

  return matches / Math.max(tokensA.size, tokensB.size);
}

// =============================================================================
// SORTING
// =============================================================================

/**
 * Sort matches by score descending, then by match type priority
 */
export function sortByScore<T extends { score: number; type: MatchType }>(
  matches: T[]
): T[] {
  const typePriority: Record<MatchType, number> = {
    exact: 0,
    partial: 1,
    similar: 2,
    none: 3,
  };

  return [...matches].sort((a, b) => {
    // Primary: score descending
    if (b.score !== a.score) return b.score - a.score;
    // Secondary: type priority
    return typePriority[a.type] - typePriority[b.type];
  });
}
