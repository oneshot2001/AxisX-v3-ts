/**
 * Heuristic Axis model matching
 *
 * Maps scraped competitor products to suggested Axis replacements
 * based on type + resolution + features matching.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ScrapedProduct, MappedProduct } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Axis model suggestions by type + resolution
// These are manually curated best-match recommendations
const AXIS_SUGGESTIONS: Record<string, Record<string, { model: string; features: string[] }>> = {
  Dome: {
    '1080p': { model: 'P3265-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4MP': { model: 'P3267-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '5MP': { model: 'P3268-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4K': { model: 'Q3538-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  },
  Bullet: {
    '1080p': { model: 'P1465-LE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4MP': { model: 'P1468-LE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '5MP': { model: 'P1468-LE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4K': { model: 'Q1786-LE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  },
  Turret: {
    '1080p': { model: 'P3265-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4MP': { model: 'P3267-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '5MP': { model: 'P3268-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
    '4K': { model: 'Q3538-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  },
  PTZ: {
    '1080p': { model: 'Q6135-LE', features: ['HDTV 1080p', '32x optical zoom', 'IR', 'DLPU'] },
    '4MP': { model: 'Q6315-LE', features: ['4MP', '31x optical zoom', 'IR', 'DLPU'] },
    '4K': { model: 'Q6318-LE', features: ['4K', '31x optical zoom', 'IR', 'DLPU'] },
  },
  Panoramic: {
    '4K': { model: 'P3807-PVE', features: ['ARTPEC-8', '180° coverage', 'DLPU'] },
    '12MP': { model: 'Q6300-E', features: ['ARTPEC-8', '360° coverage', 'DLPU'] },
    '5MP': { model: 'P3807-PVE', features: ['ARTPEC-8', '180° coverage', 'DLPU'] },
  },
  Fisheye: {
    '5MP': { model: 'M3057-PLVE Mk II', features: ['6MP', '360°', 'IR', 'DLPU'] },
    '12MP': { model: 'M4308-PLE', features: ['12MP', '360°', 'IR', 'DLPU'] },
  },
  Box: {
    '1080p': { model: 'P1375', features: ['Lightfinder 2.0', 'Forensic WDR', 'DLPU'] },
    '4MP': { model: 'P1378', features: ['Lightfinder 2.0', 'Forensic WDR', 'DLPU'] },
    '4K': { model: 'Q1656', features: ['Lightfinder 2.0', 'Forensic WDR', 'DLPU'] },
  },
  Thermal: {
    Thermal: { model: 'Q2901-E', features: ['thermal imaging', 'temperature detection'] },
  },
};

// Default fallback by resolution when type doesn't match
const DEFAULT_BY_RESOLUTION: Record<string, { model: string; features: string[] }> = {
  '1080p': { model: 'P3265-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  '4MP': { model: 'P3267-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  '5MP': { model: 'P3268-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
  '4K': { model: 'Q3538-LVE', features: ['Lightfinder 2.0', 'Forensic WDR', 'IR', 'DLPU'] },
};

function calculateConfidence(product: ScrapedProduct, suggestion: { model: string; features: string[] }): number {
  let confidence = 75; // base

  // Exact type match boosts confidence
  if (AXIS_SUGGESTIONS[product.type]) confidence += 5;

  // Resolution match boosts confidence
  if (AXIS_SUGGESTIONS[product.type]?.[product.resolution]) confidence += 5;

  // Feature overlap boosts confidence
  const lowerFeatures = product.features.map(f => f.toLowerCase());
  if (lowerFeatures.some(f => f.includes('ir'))) confidence += 2;
  if (lowerFeatures.some(f => f.includes('wdr'))) confidence += 2;
  if (lowerFeatures.some(f => f.includes('ai') || f.includes('analytics'))) confidence += 3;

  return Math.min(confidence, 95);
}

export function mapToAxis(products: ScrapedProduct[]): MappedProduct[] {
  const mapped: MappedProduct[] = [];

  for (const product of products) {
    const typeMap = AXIS_SUGGESTIONS[product.type];
    const suggestion = typeMap?.[product.resolution]
      ?? typeMap?.['1080p'] // fallback within type
      ?? DEFAULT_BY_RESOLUTION[product.resolution]
      ?? DEFAULT_BY_RESOLUTION['1080p']!; // ultimate fallback

    const confidence = calculateConfidence(product, suggestion);

    mapped.push({
      competitor_model: product.model,
      competitor_manufacturer: product.manufacturer,
      axis_replacement: suggestion.model,
      axis_features: suggestion.features,
      match_confidence: confidence,
      competitor_type: product.type,
      competitor_resolution: product.resolution,
      notes: `Auto-mapped from ${product.manufacturer} product catalog. Verify before production use.`,
    });
  }

  return mapped;
}

/**
 * Load existing mappings to avoid re-mapping already known products
 */
export function loadExistingModels(): Set<string> {
  const crossrefPath = resolve(__dirname, '../../src/data/crossref_data.json');
  const data = JSON.parse(readFileSync(crossrefPath, 'utf-8'));
  return new Set(
    data.mappings.map((m: { competitor_model: string }) => m.competitor_model.toLowerCase())
  );
}
