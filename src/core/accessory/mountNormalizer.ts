/**
 * Mount Type Normalizer
 *
 * Converts free-text mount descriptions from integrator spreadsheets
 * into standardized PlacementType values.
 *
 * Integrators write mount types inconsistently:
 *   "pole mount", "Pole", "POLE MOUNTED", "pole-mount" → all become "pole"
 */

import type { PlacementType } from '@/types';

// =============================================================================
// EXACT MATCH MAP
// =============================================================================

const MOUNT_TYPE_MAP: Record<string, PlacementType> = {
  // Pole
  'pole': 'pole',
  'pole mount': 'pole',
  'pole mounted': 'pole',
  'light pole': 'pole',
  'street pole': 'pole',

  // Wall
  'wall': 'wall',
  'wall mount': 'wall',
  'wall mounted': 'wall',
  'exterior wall': 'wall',
  'interior wall': 'wall',

  // Ceiling
  'ceiling': 'ceiling',
  'ceiling mount': 'ceiling',
  'ceiling mounted': 'ceiling',
  'drop ceiling': 'ceiling',
  'hard ceiling': 'ceiling',
  'hard lid': 'ceiling',
  't bar': 'ceiling',
  'tile ceiling': 'ceiling',

  // Recessed
  'recessed': 'recessed',
  'ceiling recessed': 'recessed',
  'recessed ceiling': 'recessed',
  'in ceiling': 'recessed',

  // Flush
  'flush': 'flush',
  'flush mount': 'flush',
  'flush mounted': 'flush',

  // Pendant
  'pendant': 'pendant',
  'pendant mount': 'pendant',
  'pendant drop': 'pendant',
  'drop mount': 'pendant',
  'hanging': 'pendant',
  'hanging mount': 'pendant',
  'suspended': 'pendant',

  // Corner
  'corner': 'corner',
  'corner mount': 'corner',
  'corner bracket': 'corner',

  // Parapet
  'parapet': 'parapet',
  'parapet mount': 'parapet',
  'roof edge': 'parapet',
  'rooftop': 'parapet',
};

// =============================================================================
// FUZZY MATCHING
// =============================================================================

/**
 * Simple Levenshtein distance for fuzzy matching close misspellings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }

  return dp[m]![n]!;
}

/**
 * Fuzzy match: find the closest mount type key within edit distance 2.
 */
function fuzzyMatchMountType(input: string): PlacementType | null {
  let bestKey: string | null = null;
  let bestDist = Infinity;

  for (const key of Object.keys(MOUNT_TYPE_MAP)) {
    const dist = levenshtein(input, key);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestKey = key;
    }
  }

  return bestKey ? MOUNT_TYPE_MAP[bestKey]! : null;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Normalize free-text mount description to PlacementType.
 * Returns null if unrecognizable — UI should flag for user review.
 *
 * Handles:
 * - Case insensitivity ("Pole Mount" → pole)
 * - Hyphens/underscores ("pole-mount" → pole)
 * - Leading/trailing whitespace
 * - Close misspellings ("ceilling" → ceiling)
 */
export function normalizeMountType(input: string): PlacementType | null {
  if (!input || !input.trim()) return null;

  const normalized = input.trim().toLowerCase().replace(/[-_]/g, ' ');

  // Exact match
  const exact = MOUNT_TYPE_MAP[normalized];
  if (exact) return exact;

  // Fuzzy match for close misspellings
  return fuzzyMatchMountType(normalized);
}
