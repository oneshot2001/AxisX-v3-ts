/**
 * Query Parser
 * 
 * Detects what type of search the user wants based on their input.
 * This is crucial for routing to the correct search logic.
 */

import type { QueryType } from '@/types';
import { normalizeMountType } from '@/core/accessory/mountNormalizer';

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

  /** Extracted model for accessory-lookup */
  readonly accessoryModel?: string;

  /** Extracted placement filter for accessory-lookup */
  readonly accessoryPlacement?: string;

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

  // Accessory-lookup detection (before axis-model, since "mounts for P3285" has a model in it)
  const accessoryMatch = detectAccessoryQuery(lower);
  if (accessoryMatch) {
    return {
      raw,
      normalized,
      type: 'accessory-lookup',
      accessoryModel: accessoryMatch.model,
      accessoryPlacement: accessoryMatch.placement,
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
// ACCESSORY QUERY DETECTION
// =============================================================================

/**
 * Model pattern used to extract camera model from accessory queries.
 * Matches Axis models (P3285-LVE, M4215, Q6135-LE) and series (P32, M42, P14).
 */
const ACCESSORY_MODEL_PATTERN = /(?:AXIS\s+)?([PMQFTVWDCA]\d{2,4}(?:-[A-Z0-9]+)*)/i;

/**
 * Patterns that indicate an accessory-lookup query.
 * Each pattern extracts a camera model. Some also extract a placement filter.
 */
const ACCESSORY_QUERY_PATTERNS: RegExp[] = [
  // "mounts for P3285-LVE", "accessories for M4215", "mounting for Q6135"
  /(?:mounts?|accessories?|mounting)\s+(?:for|with)\s+/i,
  // "what mounts work with P3265-LVE", "what accessories go with M4215"
  /what\s+(?:mounts?|accessories?)\s+(?:work|go|fit|are compatible)\s+(?:with|on|for)\s+/i,
  // "show mounts for P3285", "find accessories for M4215"
  /(?:show|find|list|get)\s+(?:mounts?|accessories?)\s+(?:for|with)\s+/i,
];

/**
 * Placement keywords that can appear before "mount for" to indicate a filter.
 * e.g., "wall mount for P3285-LVE", "pole mount for P14 series"
 */
const PLACEMENT_MOUNT_PATTERN = /^(\w+)\s+mount\s+(?:for|with)\s+/i;

interface AccessoryQueryMatch {
  model: string;
  placement?: string;
}

/**
 * Detect if a query is an accessory-lookup.
 * Returns the extracted model and optional placement, or null if not an accessory query.
 */
function detectAccessoryQuery(query: string): AccessoryQueryMatch | null {
  // Check placement-specific pattern first: "wall mount for P3285-LVE"
  const placementMatch = query.match(PLACEMENT_MOUNT_PATTERN);
  if (placementMatch) {
    const placementWord = placementMatch[1]!;
    const placement = normalizeMountType(placementWord);
    if (placement) {
      const modelMatch = query.match(ACCESSORY_MODEL_PATTERN);
      if (modelMatch) {
        return {
          model: modelMatch[1]!.toUpperCase(),
          placement,
        };
      }
    }
  }

  // Check general accessory patterns
  for (const pattern of ACCESSORY_QUERY_PATTERNS) {
    if (pattern.test(query)) {
      const modelMatch = query.match(ACCESSORY_MODEL_PATTERN);
      if (modelMatch) {
        return {
          model: modelMatch[1]!.toUpperCase(),
        };
      }
    }
  }

  return null;
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
