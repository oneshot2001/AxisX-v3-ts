/**
 * Model Aliases & Discontinued Models - Q1 2026 Update
 *
 * Aliases: Map common typos/variants to correct models
 * Discontinued: Track EOL models for search fallback
 *
 * Updated: 2026-02-04 with Q1 2026 Axis Product Catalog
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
 * - Mk II variants: MK-II, MKII, Mk II
 */
export const MODEL_ALIASES: Record<string, string> = {
  // ===========================================================================
  // Missing hyphens (common typos)
  // ===========================================================================
  'P3265LVE': 'P3265-LVE',
  'P3265LV': 'P3265-LV',
  'P3268LVE': 'P3268-LVE',
  'P3275LVE': 'P3275-LVE',
  'P3275LV': 'P3275-LV',
  'P3277LVE': 'P3277-LVE',
  'P3278LVE': 'P3278-LVE',
  'P3285LVE': 'P3285-LVE',
  'P3287LVE': 'P3287-LVE',
  'P3288LVE': 'P3288-LVE',
  'Q3538LVE': 'Q3538-LVE',
  'Q3556LVE': 'Q3556-LVE',
  'Q3558LVE': 'Q3558-LVE',
  'Q6135LE': 'Q6135-LE',
  'Q6315LE': 'Q6315-LE',
  'Q6318LE': 'Q6318-LE',
  'M3085V': 'M3085-V',
  'M4218LV': 'M4218-LV',
  'P1475LE': 'P1475-LE',
  'P1485LE': 'P1485-LE',
  'P1487LE': 'P1487-LE',
  'P1488LE': 'P1488-LE',

  // ===========================================================================
  // Invalid variants that don't exist (redirect to closest)
  // ===========================================================================
  'P3275-V': 'P3275-LV', // No bare -V variant
  'P3277-V': 'P3277-LV', // No bare -V variant
  'P3278-V': 'P3278-LV', // No bare -V variant
  'P3268-V': 'P3268-LV', // No bare -V variant
  'Q3538-V': 'Q3538-LVE', // No -V variant
  'Q3556-V': 'Q3556-LVE', // No -V variant
  'Q3558-V': 'Q3558-LVE', // No -V variant

  // ===========================================================================
  // Common confusions (-VE vs -LVE)
  // ===========================================================================
  'P3265-VE': 'P3265-LVE',
  'P3267-V': 'P3267-LV',
  'P3275-VE': 'P3275-LVE',
  'P3277-VE': 'P3277-LVE',
  'P3278-VE': 'P3278-LVE',

  // ===========================================================================
  // Legacy product renames
  // ===========================================================================
  'Q6032-E': 'Q6075-E', // Old → new naming
  'Q6034-E': 'Q6074-E',
  'Q6035-E': 'Q6075-E',

  // ===========================================================================
  // Mk II variants (normalize spelling)
  // ===========================================================================
  'A8207-VE-MKII': 'A8207-VE-MK-II',
  'A8207-VE Mk II': 'A8207-VE-MK-II',
  'A8207-VE MK II': 'A8207-VE-MK-II',
  'P5654-E-MKII': 'P5654-E-MK-II',
  'P5654-E Mk II': 'P5654-E-MK-II',
  'Q8752-E-MKII': 'Q8752-E-MK-II',
  'F9111-R-MKII': 'F9111-R-MK-II',
  'P1245-MKII': 'P1245-MK-II',
  'M3057-PLR-MKII': 'M3057-PLR-MK-II',

  // ===========================================================================
  // With AXIS prefix (shouldn't happen but just in case)
  // ===========================================================================
  'AXIS-P3265-LVE': 'P3265-LVE',
  'AXIS-Q6135-LE': 'Q6135-LE',
  'AXIS-P3275-LVE': 'P3275-LVE',
  'AXIS-P1485-LE': 'P1485-LE',
  'AXIS P3265-LVE': 'P3265-LVE',
  'AXIS P3275-LVE': 'P3275-LVE',

  // ===========================================================================
  // ARTPEC-8 → ARTPEC-9 migration paths (recommended upgrades)
  // ===========================================================================
  // These are not aliases but helpful redirects for discontinued models
  // Note: P3265 → P3275, Q3536 → Q3556, Q3538 → Q3558
};

// =============================================================================
// DISCONTINUED MODELS
// =============================================================================

/**
 * Models that are end-of-life (Q1 2026 update)
 *
 * These will use search fallback URLs since product pages
 * may redirect or show "discontinued" notices.
 *
 * Updated based on:
 * - axis_camera_catalog_2026.json lifecycle_notes
 * - crossref_data_v5.json discontinuation data
 */
export const DISCONTINUED_MODELS: string[] = [
  // ===========================================================================
  // P-SERIES BULLETS - Discontinued
  // ===========================================================================
  'P1455-LE', // Replaced by P1485-LE (ARTPEC-9)
  'P1455-LE-3', // Replaced by P1465-LE-3

  // ===========================================================================
  // P-SERIES DOMES - Migrating to ARTPEC-9
  // ===========================================================================
  // Note: P3265/P3267/P3268 are being phased out in favor of P3275/P3277/P3278
  'P3265-V', // Replaced by P3275-LV
  'P3265-LVE', // Replaced by P3275-LVE (phasing)
  'P3267-LV', // Replaced by P3277-LV
  'P3267-LVE', // Replaced by P3277-LVE
  'P3268-LV', // Replaced by P3278-LV
  'P3268-LVE', // Replaced by P3278-LVE

  // P32xx - Legacy discontinued
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

  // ===========================================================================
  // Q-SERIES DOMES - Migrating to ARTPEC-9
  // ===========================================================================
  'Q3536-LVE', // Replaced by Q3556-LVE
  'Q3538-LVE', // Replaced by Q3558-LVE

  // Q-Series Legacy
  'Q3504-V',
  'Q3504-VE',
  'Q3505-V',
  'Q3505-VE',
  'Q3505-SVE',
  'Q3617-VE',
  'Q1647-LE', // Replaced by Q1656-LE

  // ===========================================================================
  // Q-SERIES PTZ - Legacy
  // ===========================================================================
  'Q6000-E',
  'Q6032-E',
  'Q6034-E',
  'Q6035-E',
  'Q6042-E',
  'Q6044-E',
  'Q6045-E',
  'Q1798-LE', // Replaced by Q1808-LE

  // ===========================================================================
  // Q-SERIES THERMAL - Legacy
  // ===========================================================================
  'Q1932-E', // Replaced by Q1972-E

  // ===========================================================================
  // M-SERIES - Legacy
  // ===========================================================================
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
  'M3065-V', // Replaced by M3085-V
  'M5014', // Replaced by M5074
  'M5525-E', // Replaced by M5526-E

  // ===========================================================================
  // LEGACY BOX CAMERAS
  // ===========================================================================
  'P1343',
  'P1344',
  'P1346',
  'P1347',
  'P1353',
  'P1354',
  'P1355',
  'P1357',

  // ===========================================================================
  // LEGACY BOX/BULLET Q-SERIES
  // ===========================================================================
  'Q1604',
  'Q1614',
  'Q1615',
  'Q1755',
  'Q1765-LE',

  // ===========================================================================
  // MODULAR/OTHER LEGACY
  // ===========================================================================
  'F9111', // Replaced by F9111-R-MK-II
  'A8105-E', // Replaced by I8116-E
  'Q7411', // Replaced by P7304
];

/**
 * Check if a model is discontinued
 */
export function isDiscontinued(model: string): boolean {
  const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
  return DISCONTINUED_MODELS.some(
    (m) => m.toUpperCase() === normalized
  );
}

/**
 * Get replacement for discontinued model (if known)
 * Returns undefined if no direct replacement mapping
 *
 * Updated with Q1 2026 replacement paths
 */
export function getDiscontinuedReplacement(model: string): string | undefined {
  const replacements: Record<string, string> = {
    // P32xx Legacy → Current
    'P3364-LVE': 'P3265-LVE',
    'P3364-LV': 'P3265-LV',
    'P3364-VE': 'P3265-LVE',
    'P3364-V': 'P3265-V',
    'P3365-VE': 'P3265-LVE',
    'P3384-VE': 'P3268-LVE',
    'P3225-LVE': 'P3245-LVE',
    'P3225-LV': 'P3245-LV',

    // P32xx ARTPEC-8 → ARTPEC-9 (recommended upgrades)
    'P3265-V': 'P3275-LV',
    'P3265-LVE': 'P3275-LVE',
    'P3265-LV': 'P3275-LV',
    'P3267-LV': 'P3277-LV',
    'P3267-LVE': 'P3277-LVE',
    'P3268-LV': 'P3278-LV',
    'P3268-LVE': 'P3278-LVE',

    // P14xx Bullets
    'P1455-LE': 'P1485-LE',
    'P1455-LE-3': 'P1465-LE-3',

    // Q35xx ARTPEC-8 → ARTPEC-9
    'Q3536-LVE': 'Q3556-LVE',
    'Q3538-LVE': 'Q3558-LVE',

    // Q-Series PTZ Legacy
    'Q6044-E': 'Q6075-E',
    'Q6045-E': 'Q6075-SE',
    'Q6032-E': 'Q6075-E',
    'Q6034-E': 'Q6074-E',
    'Q6035-E': 'Q6075-E',

    // Q-Series Bullets/Box
    'Q1647-LE': 'Q1656-LE',
    'Q1798-LE': 'Q1808-LE',

    // Q-Series Thermal
    'Q1932-E': 'Q1972-E',

    // M-Series
    'M3044-V': 'M3085-V',
    'M3045-V': 'M3086-V',
    'M3046-V': 'M3086-V',
    'M3065-V': 'M3085-V',
    'M5014': 'M5074',
    'M5525-E': 'M5526-E',

    // Modular/Specialty
    'F9111': 'F9111-R-MK-II',
    'A8105-E': 'I8116-E',
    'Q7411': 'P7304',
  };

  const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
  return replacements[normalized];
}

/**
 * Lifecycle status for models being phased out
 * These are still available but have announced replacements
 */
export const PHASING_OUT_MODELS: Record<string, { replacement: string; note: string }> = {
  'P3265-LVE': {
    replacement: 'P3275-LVE',
    note: 'ARTPEC-9 upgrade available'
  },
  'P3267-LVE': {
    replacement: 'P3277-LVE',
    note: 'ARTPEC-9 upgrade available'
  },
  'P3268-LVE': {
    replacement: 'P3278-LVE',
    note: 'ARTPEC-9 upgrade available'
  },
  'Q3536-LVE': {
    replacement: 'Q3556-LVE',
    note: 'ARTPEC-9 upgrade - improved AI analytics'
  },
  'Q3538-LVE': {
    replacement: 'Q3558-LVE',
    note: 'ARTPEC-9 upgrade - improved AI analytics'
  },
};

/**
 * Check if model is being phased out (still available but has newer replacement)
 */
export function isPhasingOut(model: string): boolean {
  const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
  return normalized in PHASING_OUT_MODELS;
}
