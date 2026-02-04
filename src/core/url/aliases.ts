/**
 * Model Aliases & Discontinued Models
 * 
 * Aliases: Map common typos/variants to correct models
 * Discontinued: Track EOL models for search fallback
 */

// =============================================================================
// MODEL ALIASES
// =============================================================================

/**
 * Common typos, variants, and shortcuts → canonical model
 * 
 * Use cases:
 * - Missing hyphen: P3265LVE → P3265-LVE
 * - Invalid variant: P3275-V → P3275-LV (no bare -V exists)
 * - Old naming: Q6032-E → Q6075-E (product rename)
 * - Shortcuts: P32 → P3265-LVE (popular default)
 */
export const MODEL_ALIASES: Record<string, string> = {
  // Missing hyphens
  'P3265LVE': 'P3265-LVE',
  'P3265LV': 'P3265-LV',
  'P3268LVE': 'P3268-LVE',
  'Q3538LVE': 'Q3538-LVE',
  'Q6135LE': 'Q6135-LE',
  'M3085V': 'M3085-V',
  'M4218LV': 'M4218-LV',
  
  // Invalid variants that don't exist
  'P3275-V': 'P3275-LV',      // No bare -V
  'P3268-V': 'P3268-LV',      // No bare -V
  'Q3538-V': 'Q3538-LVE',     // No -V variant
  
  // Common confusions
  'P3265-VE': 'P3265-LVE',    // Confused with -LVE
  'P3267-V': 'P3267-LV',
  
  // Legacy renames
  'Q6032-E': 'Q6075-E',       // Old → new naming
  'Q6034-E': 'Q6074-E',
  'Q6035-E': 'Q6075-E',
  
  // With AXIS prefix (shouldn't happen but just in case)
  'AXIS-P3265-LVE': 'P3265-LVE',
  'AXIS-Q6135-LE': 'Q6135-LE',
};

// =============================================================================
// DISCONTINUED MODELS
// =============================================================================

/**
 * Models that are end-of-life
 * 
 * These will use search fallback URLs since product pages
 * may redirect or show "discontinued" notices.
 */
export const DISCONTINUED_MODELS: string[] = [
  // P-Series Legacy
  'P3214-V',
  'P3214-VE',
  'P3215-V',
  'P3215-VE',
  'P3224-LV',
  'P3224-LVE',
  'P3224-V',
  'P3224-VE',
  'P3225-LV',
  'P3225-LVE',
  'P3225-V',
  'P3225-VE',
  'P3227-LV',
  'P3227-LVE',
  'P3228-LV',
  'P3228-LVE',
  'P3235-LV',
  'P3235-LVE',
  'P3354',
  'P3363-V',
  'P3363-VE',
  'P3364-LV',
  'P3364-LVE',
  'P3364-V',
  'P3364-VE',
  'P3365-V',
  'P3365-VE',
  'P3367-V',
  'P3367-VE',
  'P3384-V',
  'P3384-VE',
  
  // Q-Series Legacy
  'Q3504-V',
  'Q3504-VE',
  'Q3505-V',
  'Q3505-VE',
  'Q3505-SVE',
  'Q3617-VE',
  'Q6000-E',
  'Q6032-E',
  'Q6034-E',
  'Q6035-E',
  'Q6042-E',
  'Q6044-E',
  'Q6045-E',
  
  // M-Series Legacy
  'M3004-V',
  'M3005-V',
  'M3006-V',
  'M3007-PV',
  'M3014',
  'M3015',
  'M3024-LVE',
  'M3025-VE',
  'M3026-VE',
  'M3027-PVE',
  'M3037-PVE',
  'M3044-V',
  'M3045-V',
  'M3046-V',
  'M3047-P',
  'M3048-P',
  
  // Very old models
  'P1343',
  'P1344',
  'P1346',
  'P1347',
  'P1353',
  'P1354',
  'P1355',
  'P1357',
  'Q1604',
  'Q1614',
  'Q1615',
  'Q1755',
  'Q1765-LE',
  
  // Add more as identified
];

/**
 * Check if a model is discontinued
 */
export function isDiscontinued(model: string): boolean {
  const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
  return DISCONTINUED_MODELS.includes(normalized);
}

/**
 * Get replacement for discontinued model (if known)
 * Returns undefined if no direct replacement mapping
 */
export function getDiscontinuedReplacement(model: string): string | undefined {
  const replacements: Record<string, string> = {
    'P3364-LVE': 'P3265-LVE',
    'P3364-LV': 'P3265-LV',
    'P3364-VE': 'P3265-LVE',
    'P3364-V': 'P3265-V',
    'P3365-VE': 'P3265-LVE',
    'P3384-VE': 'P3268-LVE',
    'Q6044-E': 'Q6075-E',
    'Q6045-E': 'Q6075-SE',
    'M3044-V': 'M3085-V',
    'M3045-V': 'M3086-V',
    'M3046-V': 'M3086-V',
  };

  const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
  return replacements[normalized];
}
