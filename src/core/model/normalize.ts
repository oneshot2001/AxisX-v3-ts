/**
 * Shared model normalization and base-model derivation.
 *
 * Centralizing this logic keeps URL/MSRP/spec lookups consistent.
 */

const MODEL_VARIANT_SUFFIXES = [
  '-60HZ', '-50HZ', '60HZ', '50HZ',
  '-EUR', '-US', '-BR', '-NM', '-AR',
  'EUR', 'US', 'BR', 'NM', 'AR',
  '-24V', '-M12', '-ZOOM', '24V', 'M12',
  '-BULK', 'BULK',
] as const;

const LENS_PATTERN = /-?\d+MM$/i;

/**
 * Normalize a model key for lookup use.
 */
export function normalizeModelKey(model: string): string {
  return model
    .toUpperCase()
    .replace(/^AXIS\s*/i, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Return normalized base model key with variants stripped.
 */
export function getBaseModelKey(model: string): string {
  let base = normalizeModelKey(model);
  let changed = true;

  // Strip stacked suffixes safely.
  while (changed) {
    changed = false;
    for (const suffix of MODEL_VARIANT_SUFFIXES) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length);
        changed = true;
      }
    }
  }

  base = base.replace(LENS_PATTERN, '');
  return base.replace(/-+$/, '');
}

