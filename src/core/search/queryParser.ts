/**
 * Query Parser
 * 
 * Detects what type of search the user wants based on their input.
 * This is crucial for routing to the correct search logic.
 */

import type { QueryType } from '@/types';

// =============================================================================
// PATTERNS
// =============================================================================

/**
 * Regex for Axis model numbers
 * Matches: P3265, Q6135-LE, M3085-V, AXIS P3265-LVE, etc.
 */
const AXIS_MODEL_PATTERN = /^(AXIS\s*)?[PMQFTVWDCA]\d{4}/i;

/**
 * Known manufacturer names (lowercase for matching)
 */
const MANUFACTURERS = [
  // NDAA Banned
  'hikvision', 'hik', 'dahua', 'dh', 'uniview', 'unv',
  // Cloud
  'verkada', 'rhombus',
  // Korean
  'hanwha', 'hanwha vision', 'wisenet', 'samsung',
  // Japanese
  'i-pro', 'ipro', 'panasonic',
  // Motorola
  'avigilon', 'pelco',
  // Others
  'vivotek', 'bosch', 'sony', 'canon', 'honeywell',
  'arecont', 'march networks', '2n',
] as const;

/**
 * Manufacturer aliases → canonical name
 */
const MANUFACTURER_ALIASES: Record<string, string> = {
  'hik': 'Hikvision',
  'dh': 'Dahua',
  'unv': 'Uniview',
  'ipro': 'i-PRO',
  'wisenet': 'Hanwha Vision',
  'samsung': 'Hanwha Vision', // Samsung security → Hanwha
};

// =============================================================================
// QUERY TYPE DETECTION
// =============================================================================

export interface ParsedQuery {
  /** Original input */
  readonly raw: string;

  /** Normalized for searching */
  readonly normalized: string;

  /** Detected query type */
  readonly type: QueryType;

  /** Extracted manufacturer (if type is 'manufacturer') */
  readonly manufacturer?: string;

  /** Is the query empty? */
  readonly isEmpty: boolean;
}

/**
 * Parse and classify a search query
 */
export function parseQuery(input: string): ParsedQuery {
  const raw = input;
  const trimmed = input.trim();
  const normalized = trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();

  // Empty query
  if (!trimmed) {
    return {
      raw,
      normalized: '',
      type: 'competitor',
      isEmpty: true,
    };
  }

  // "axis" by itself → browse mode
  if (lower === 'axis' || lower === 'axis communications') {
    return {
      raw,
      normalized,
      type: 'axis-browse',
      isEmpty: false,
    };
  }

  // Axis model pattern → direct lookup
  if (AXIS_MODEL_PATTERN.test(trimmed)) {
    return {
      raw,
      normalized: normalized.replace(/^AXIS\s*/i, ''),
      type: 'axis-model',
      isEmpty: false,
    };
  }

  // Check for manufacturer name
  const matchedManufacturer = findManufacturer(lower);
  if (matchedManufacturer) {
    return {
      raw,
      normalized,
      type: 'manufacturer',
      manufacturer: matchedManufacturer,
      isEmpty: false,
    };
  }

  // Check for legacy Axis model (discontinued)
  // Legacy models often have older naming patterns
  if (isLikelyLegacyAxisModel(trimmed)) {
    return {
      raw,
      normalized,
      type: 'legacy',
      isEmpty: false,
    };
  }

  // Default: competitor model search
  return {
    raw,
    normalized,
    type: 'competitor',
    isEmpty: false,
  };
}

/**
 * Find manufacturer match in query
 */
function findManufacturer(query: string): string | undefined {
  // Check aliases first
  const aliasMatch = MANUFACTURER_ALIASES[query];
  if (aliasMatch) return aliasMatch;

  // Check full manufacturer names
  for (const mfr of MANUFACTURERS) {
    if (query === mfr) {
      return MANUFACTURER_ALIASES[mfr] ?? capitalizeManufacturer(mfr);
    }

    if (query.startsWith(mfr + ' ')) {
      const remainder = query.slice(mfr.length).trim();

      // Inputs like "Hikvision DS-2CD2143..." should be treated as model queries,
      // not manufacturer browse.
      if (looksLikeModelQuery(remainder)) {
        return undefined;
      }

      // Return canonical name
      return MANUFACTURER_ALIASES[mfr] ?? capitalizeManufacturer(mfr);
    }
  }

  return undefined;
}

function looksLikeModelQuery(query: string): boolean {
  // Most camera model numbers include at least one digit.
  return /\d/.test(query);
}

/**
 * Capitalize manufacturer name properly
 */
function capitalizeManufacturer(name: string): string {
  const specialCases: Record<string, string> = {
    'i-pro': 'i-PRO',
    'ipro': 'i-PRO',
    '2n': '2N',
  };

  if (specialCases[name]) return specialCases[name];

  return name
    .split(/[\s-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Heuristic: is this likely a legacy Axis model?
 * 
 * Legacy patterns:
 * - Older P-series without modern suffixes (P3364, P3384)
 * - M-series with older numbers
 * - Models we know are discontinued
 */
function isLikelyLegacyAxisModel(query: string): boolean {
  const normalized = query.toUpperCase().replace(/^AXIS\s*/i, '');

  // Known discontinued model prefixes
  const legacyPrefixes = [
    'P3364', 'P3384', 'P3354', 'P3346',
    'M3044', 'M3045', 'M3046',
    'Q1614', 'Q1615', 'Q6044',
  ];

  return legacyPrefixes.some(prefix => normalized.startsWith(prefix));
}

// =============================================================================
// QUERY VALIDATION
// =============================================================================

/**
 * Minimum query length for meaningful search
 */
export const MIN_QUERY_LENGTH = 2;

/**
 * Maximum query length (prevent abuse)
 */
export const MAX_QUERY_LENGTH = 100;

/**
 * Validate query input
 */
export function validateQuery(query: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: true }; // Empty is valid (shows default state)
  }

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Query must be at least ${MIN_QUERY_LENGTH} characters`,
    };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Query cannot exceed ${MAX_QUERY_LENGTH} characters`,
    };
  }

  return { valid: true };
}

// =============================================================================
// BATCH PARSING
// =============================================================================

/**
 * Parse batch input (multiple models)
 * Supports: newlines, commas, semicolons, tabs
 */
export function parseBatchInput(input: string): string[] {
  const items = input
    .split(/[\n,;\t]+/)
    .map(item => item.trim())
    .filter(item => item.length >= MIN_QUERY_LENGTH);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  return items.filter(item => {
    const normalized = item.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

/**
 * Maximum items in a batch
 */
export const MAX_BATCH_SIZE = 200;

/**
 * Validate batch input
 */
export function validateBatch(items: string[]): {
  valid: boolean;
  error?: string;
} {
  if (items.length === 0) {
    return { valid: false, error: 'No valid items found' };
  }

  if (items.length > MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Batch cannot exceed ${MAX_BATCH_SIZE} items`,
    };
  }

  return { valid: true };
}
