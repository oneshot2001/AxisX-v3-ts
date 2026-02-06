/**
 * Merge crossref_data_v5.json into src/data/crossref_data.json
 *
 * v5 has 305 entries in a mixed mappings[] array:
 * - 190 entries with `competitor_model` key (competitor format)
 * - 115 entries with `legacy_model` key (legacy format - mostly competitor products, some Axis legacy)
 *
 * This script transforms both formats into our production types
 * (CompetitorMapping / LegacyAxisMapping) and merges them,
 * deduplicating against existing entries.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// Source and target paths
const V5_PATH = resolve(
  PROJECT_ROOT,
  '../../AxisX Docs/Updated Third Party Manufacture Camera Data/files/crossref_data_v5.json'
);
const TARGET_PATH = resolve(PROJECT_ROOT, 'src/data/crossref_data.json');

// ---- Types matching production interfaces ----

interface CompetitorMapping {
  competitor_model: string;
  competitor_manufacturer: string;
  axis_replacement: string;
  axis_features?: string[];
  match_confidence: number;
  competitor_type?: string;
  competitor_resolution?: string;
  notes?: string;
  _remove?: boolean; // internal cleanup flag
}

interface LegacyAxisMapping {
  legacy_model: string;
  replacement_model: string;
  notes?: string;
  discontinued_year?: number;
}

interface CrossRefData {
  mappings: CompetitorMapping[];
  axis_legacy_database: {
    mappings: LegacyAxisMapping[];
  };
  metadata?: {
    version: string;
    last_updated: string;
    total_mappings: number;
    total_legacy_mappings?: number;
    source?: string;
  };
}

// ---- v5 source types ----

interface V5CompetitorEntry {
  id: string;
  competitor_model: string;
  competitor_manufacturer: string;
  competitor_series?: string;
  competitor_type: string;
  competitor_resolution: string;
  competitor_features?: string[];
  axis_model: string;
  axis_series?: string;
  match_confidence: number;
  match_rationale: string;
}

interface V5LegacyEntry {
  legacy_model: string;
  manufacturer: string;
  axis_replacement: string;
  confidence: string;
  notes: string;
  legacy_specs: {
    resolution: string;
    form_factor: string;
    features: string[];
  };
  axis_specs: {
    resolution: string;
    form_factor: string;
    features: string[];
    ip_rating?: string | null;
    ik_rating?: string | null;
    source_url?: string;
  };
  lifecycle_status?: string;
  discontinuation_date?: string | null;
  support_until?: string | null;
  source_url?: string;
  data_source?: string;
  last_verified?: string;
}

// ---- Helpers ----

function normalizeModel(model: string): string {
  return model.trim().toLowerCase().replace(/\s+/g, ' ');
}

function confidenceToNumber(confidence: string): number {
  switch (confidence.toLowerCase()) {
    case 'high': return 90;
    case 'medium': return 75;
    case 'low': return 50;
    default: return 70;
  }
}

function extractDiscontinuedYear(entry: V5LegacyEntry): number | undefined {
  if (entry.discontinuation_date) {
    const year = new Date(entry.discontinuation_date).getFullYear();
    if (!isNaN(year)) return year;
  }
  // Try parsing from notes (e.g., "Discontinued: 2023-02-28")
  const match = entry.notes?.match(/Discontinued:\s*(\d{4})/i);
  if (match?.[1]) return parseInt(match[1], 10);
  return undefined;
}

function isAxisLegacy(entry: V5LegacyEntry): boolean {
  return entry.manufacturer === 'Axis Communications';
}

function hasNonAxisReplacement(entry: V5LegacyEntry): boolean {
  // Some v5 legacy entries map manufacturer-to-manufacturer (not to Axis)
  // e.g., Hikvision old -> Hikvision new, or Genetec old -> Genetec new
  const replacement = entry.axis_replacement.toUpperCase();
  return (
    replacement.startsWith('DS-') ||
    replacement.startsWith('IDS-') ||
    replacement.startsWith('DH-') ||
    replacement.startsWith('IPC-') ||
    replacement.startsWith('AUTOVU')
  );
}

function stripManufacturerPrefix(model: string, manufacturer: string): string {
  // Remove redundant manufacturer name prefix from model (e.g., "Vivotek FD9167-H" -> "FD9167-H")
  const prefix = manufacturer + ' ';
  if (model.startsWith(prefix)) {
    return model.slice(prefix.length);
  }
  return model;
}

// ---- Transform functions ----

function transformV5Competitor(entry: V5CompetitorEntry): CompetitorMapping {
  const mapping: CompetitorMapping = {
    competitor_model: entry.competitor_model,
    competitor_manufacturer: entry.competitor_manufacturer,
    axis_replacement: entry.axis_model,
    match_confidence: entry.match_confidence,
    competitor_type: entry.competitor_type,
    competitor_resolution: entry.competitor_resolution,
    notes: entry.match_rationale,
  };

  return mapping;
}

function transformV5LegacyToCompetitor(entry: V5LegacyEntry): CompetitorMapping {
  const axisFeatures = entry.axis_specs?.features?.length
    ? entry.axis_specs.features
    : undefined;

  const cleanModel = stripManufacturerPrefix(entry.legacy_model, entry.manufacturer);

  return {
    competitor_model: cleanModel,
    competitor_manufacturer: entry.manufacturer,
    axis_replacement: entry.axis_replacement,
    match_confidence: confidenceToNumber(entry.confidence),
    competitor_type: entry.legacy_specs?.form_factor || undefined,
    competitor_resolution: entry.legacy_specs?.resolution !== 'N/A'
      ? entry.legacy_specs?.resolution
      : undefined,
    notes: entry.notes,
    ...(axisFeatures ? { axis_features: axisFeatures } : {}),
  };
}

function transformV5LegacyToAxisLegacy(entry: V5LegacyEntry): LegacyAxisMapping {
  // Strip "AXIS " prefix for consistency with existing data
  const legacyModel = entry.legacy_model.replace(/^AXIS\s+/i, '');
  const replacementModel = entry.axis_replacement.replace(/^AXIS\s+/i, '');

  return {
    legacy_model: legacyModel,
    replacement_model: replacementModel,
    notes: entry.notes,
    discontinued_year: extractDiscontinuedYear(entry),
  };
}

// ---- Main merge ----

function main() {
  console.log('=== AxisX v5 Data Merge ===\n');

  // Load source and target
  const v5Raw = JSON.parse(readFileSync(V5_PATH, 'utf-8'));
  const target: CrossRefData = JSON.parse(readFileSync(TARGET_PATH, 'utf-8'));

  const v5Mappings = v5Raw.mappings as Array<V5CompetitorEntry | V5LegacyEntry>;
  console.log(`Source: ${v5Mappings.length} v5 entries`);
  console.log(`Target: ${target.mappings.length} competitor + ${target.axis_legacy_database.mappings.length} legacy entries\n`);

  // Separate v5 entries by type
  const v5Competitors: V5CompetitorEntry[] = [];
  const v5LegacyCompetitor: V5LegacyEntry[] = [];
  const v5LegacyAxis: V5LegacyEntry[] = [];
  let v5Skipped = 0;

  for (const entry of v5Mappings) {
    if ('competitor_model' in entry) {
      v5Competitors.push(entry as V5CompetitorEntry);
    } else if ('legacy_model' in entry) {
      const legacy = entry as V5LegacyEntry;
      if (isAxisLegacy(legacy)) {
        v5LegacyAxis.push(legacy);
      } else if (hasNonAxisReplacement(legacy)) {
        // Skip manufacturer-to-manufacturer mappings (e.g., Hikvision old -> Hikvision new)
        v5Skipped++;
      } else {
        v5LegacyCompetitor.push(legacy);
      }
    }
  }

  console.log(`v5 breakdown:`);
  console.log(`  Competitor entries: ${v5Competitors.length}`);
  console.log(`  Legacy->CompetitorMapping: ${v5LegacyCompetitor.length}`);
  console.log(`  Legacy->AxisLegacy: ${v5LegacyAxis.length}`);
  console.log(`  Skipped (mfr-to-mfr): ${v5Skipped}\n`);

  // Build dedup index from existing data
  const existingCompetitorModels = new Set(
    target.mappings.map(m => normalizeModel(m.competitor_model))
  );
  const existingLegacyModels = new Set(
    target.axis_legacy_database.mappings.map(m => normalizeModel(m.legacy_model))
  );

  // Transform and deduplicate competitor entries
  let newCompetitorCount = 0;
  let dupCompetitorCount = 0;

  for (const entry of v5Competitors) {
    const normalized = normalizeModel(entry.competitor_model);
    if (existingCompetitorModels.has(normalized)) {
      dupCompetitorCount++;
      continue;
    }
    existingCompetitorModels.add(normalized);
    target.mappings.push(transformV5Competitor(entry));
    newCompetitorCount++;
  }

  // Transform and deduplicate legacy-as-competitor entries
  for (const entry of v5LegacyCompetitor) {
    const normalized = normalizeModel(entry.legacy_model);
    if (existingCompetitorModels.has(normalized)) {
      dupCompetitorCount++;
      continue;
    }
    existingCompetitorModels.add(normalized);
    target.mappings.push(transformV5LegacyToCompetitor(entry));
    newCompetitorCount++;
  }

  // Transform and deduplicate Axis legacy entries
  let newLegacyCount = 0;
  let dupLegacyCount = 0;

  for (const entry of v5LegacyAxis) {
    const legacyModel = normalizeModel(entry.legacy_model.replace(/^AXIS\s+/i, ''));
    if (existingLegacyModels.has(legacyModel)) {
      dupLegacyCount++;
      continue;
    }
    existingLegacyModels.add(legacyModel);
    target.axis_legacy_database.mappings.push(transformV5LegacyToAxisLegacy(entry));
    newLegacyCount++;
  }

  // --- Post-merge data cleanup ---
  let cleanupCount = 0;

  // Remove entries with non-Axis replacements (Genetec-to-Genetec etc.)
  const beforeCleanup = target.mappings.length;
  target.mappings = target.mappings.filter(m => {
    const r = m.axis_replacement.toUpperCase();
    const isNonAxis = r.startsWith('DS-') || r.startsWith('IDS-') || r.startsWith('DH-') ||
      r.startsWith('IPC-') || r.startsWith('AUTOVU');
    if (isNonAxis) cleanupCount++;
    return !isNonAxis;
  });

  // Strip manufacturer name prefixes from model names
  for (const m of target.mappings) {
    const prefix = m.competitor_manufacturer + ' ';
    if (m.competitor_model.startsWith(prefix)) {
      const cleaned = m.competitor_model.slice(prefix.length);
      // Check if the cleaned version already exists (avoid creating duplicates)
      const existing = target.mappings.find(
        other => other !== m && normalizeModel(other.competitor_model) === normalizeModel(cleaned) &&
          normalizeModel(other.competitor_manufacturer) === normalizeModel(m.competitor_manufacturer)
      );
      if (existing) {
        m._remove = true;
        cleanupCount++;
      } else {
        m.competitor_model = cleaned;
        cleanupCount++;
      }
    }
  }
  target.mappings = target.mappings.filter(m => !m._remove);
  // Remove internal flag from remaining entries
  for (const m of target.mappings) {
    delete m._remove;
  }

  if (cleanupCount > 0) {
    console.log(`Data cleanup: ${cleanupCount} entries fixed/removed`);
  }

  // Sort competitor mappings alphabetically by manufacturer then model
  target.mappings.sort((a, b) => {
    const mfrCmp = a.competitor_manufacturer.localeCompare(b.competitor_manufacturer);
    if (mfrCmp !== 0) return mfrCmp;
    return a.competitor_model.localeCompare(b.competitor_model);
  });

  // Sort legacy mappings alphabetically
  target.axis_legacy_database.mappings.sort((a, b) =>
    a.legacy_model.localeCompare(b.legacy_model)
  );

  // Update metadata
  const today = new Date().toISOString().split('T')[0];
  target.metadata = {
    version: '4.0.0',
    last_updated: today!,
    total_mappings: target.mappings.length,
    total_legacy_mappings: target.axis_legacy_database.mappings.length,
    source: 'Q1 2026 Axis Product Guide + crossref_data_v5.json merged',
  };

  // Write output
  writeFileSync(TARGET_PATH, JSON.stringify(target, null, 2) + '\n', 'utf-8');

  // Summary
  console.log('--- Merge Results ---');
  console.log(`New competitor mappings added: ${newCompetitorCount}`);
  console.log(`Duplicate competitor entries skipped: ${dupCompetitorCount}`);
  console.log(`New Axis legacy mappings added: ${newLegacyCount}`);
  console.log(`Duplicate legacy entries skipped: ${dupLegacyCount}`);
  console.log('');
  console.log(`Final totals:`);
  console.log(`  Competitor mappings: ${target.mappings.length}`);
  console.log(`  Legacy mappings: ${target.axis_legacy_database.mappings.length}`);
  console.log(`\nOutput: ${TARGET_PATH}`);

  // Print sample of new entries
  if (newCompetitorCount > 0) {
    console.log('\n--- Sample New Competitor Entries ---');
    const newEntries = target.mappings.slice(-Math.min(5, newCompetitorCount));
    for (const entry of newEntries) {
      console.log(`  ${entry.competitor_manufacturer} ${entry.competitor_model} -> ${entry.axis_replacement} (${entry.match_confidence}%)`);
    }
  }
}

main();
