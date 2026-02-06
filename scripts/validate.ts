/**
 * Validates scraped/mapped data against the CompetitorMapping schema
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MappedProduct, ValidationResult } from './scraper/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VALID_MANUFACTURERS = new Set([
  'Hikvision', 'Dahua', 'Uniview', 'Hanwha Vision', 'Hanwha',
  'i-PRO', 'Panasonic', 'Avigilon', 'Pelco', 'Verkada',
  'Rhombus', 'Vivotek', 'Bosch', 'Sony', 'Canon',
  'Arecont Vision', 'March Networks', 'Honeywell', '2N',
  'Samsung', 'IQinVision', 'Genetec', 'Motorola Solutions',
]);

const VALID_TYPES = new Set([
  'Dome', 'Bullet', 'Turret', 'PTZ', 'Box', 'Panoramic',
  'Fisheye', 'Thermal', 'Encoder', 'NVR', 'Door Station',
  'indoor dome', 'outdoor dome', 'indoor bullet', 'outdoor bullet',
]);

const VALID_RESOLUTIONS = new Set([
  'VGA', '720p', '1080p', '3MP', '4MP', '5MP', '6MP', '4K', '8MP', '12MP',
  'Thermal', 'Multi-sensor', 'N/A',
]);

export function validateMappedProducts(products: MappedProduct[]): ValidationResult {
  const valid: MappedProduct[] = [];
  const invalid: ValidationResult['invalid'] = [];
  const warnings: string[] = [];

  for (const product of products) {
    const issues: string[] = [];

    if (!product.competitor_model?.trim()) {
      issues.push('Missing competitor_model');
    }

    if (!product.competitor_manufacturer?.trim()) {
      issues.push('Missing competitor_manufacturer');
    } else if (!VALID_MANUFACTURERS.has(product.competitor_manufacturer)) {
      warnings.push(`Unknown manufacturer: ${product.competitor_manufacturer}`);
    }

    if (!product.axis_replacement?.trim()) {
      issues.push('Missing axis_replacement');
    }

    if (typeof product.match_confidence !== 'number' || product.match_confidence < 0 || product.match_confidence > 100) {
      issues.push(`Invalid match_confidence: ${product.match_confidence}`);
    }

    if (product.match_confidence < 70) {
      warnings.push(`Low confidence for ${product.competitor_model}: ${product.match_confidence}%`);
    }

    if (issues.length > 0) {
      invalid.push({ product, reason: issues.join('; ') });
    } else {
      valid.push(product);
    }
  }

  return { valid, invalid, warnings };
}

/**
 * CLI entrypoint: validate a JSON file of mapped products
 */
async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.log('Usage: npm run scrape:validate <file.json>');
    console.log('  Validates scraped/mapped data against the CompetitorMapping schema');
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), inputFile);
  console.log(`Validating: ${filePath}\n`);

  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const products: MappedProduct[] = Array.isArray(data) ? data : data.products ?? data.mapped ?? [];

  const result = validateMappedProducts(products);

  console.log(`Valid:    ${result.valid.length}`);
  console.log(`Invalid:  ${result.invalid.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.invalid.length > 0) {
    console.log('\n--- Invalid Entries ---');
    for (const { product, reason } of result.invalid) {
      const name = 'competitor_model' in product ? product.competitor_model : ('model' in product ? product.model : '(unnamed)');
      console.log(`  ${name}: ${reason}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log('\n--- Warnings ---');
    for (const w of result.warnings) {
      console.log(`  ${w}`);
    }
  }
}

// Only run CLI when executed directly (not when imported)
const isDirectExecution = process.argv[1]?.endsWith('validate.ts') || process.argv[1]?.endsWith('validate.js');
if (isDirectExecution) {
  main().catch(console.error);
}
