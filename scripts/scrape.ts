/**
 * CLI orchestrator for scraping competitor product catalogs
 *
 * Usage:
 *   npm run scrape                     # Run all scrapers
 *   npm run scrape -- --dry-run        # Scrape without merging into crossref
 *   npm run scrape -- --manufacturer hikvision  # Run specific manufacturer
 *   npm run scrape -- --verbose        # Verbose output
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapToAxis, loadExistingModels } from './scraper/mapper.js';
import { validateMappedProducts } from './validate.js';
import type { BaseScraper } from './scraper/base.js';
import type { ScrapeResult, MappedProduct, PipelineOptions } from './scraper/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(__dirname, 'output');
const CROSSREF_PATH = resolve(PROJECT_ROOT, 'src/data/crossref_data.json');

// Registry of available scrapers (lazy-loaded)
const SCRAPER_REGISTRY: Record<string, () => Promise<BaseScraper>> = {
  // Tier 1 - NDAA banned (cheerio)
  hikvision: () => import('./scraper/hikvision.js').then(m => new m.HikvisionScraper()),
  dahua: () => import('./scraper/dahua.js').then(m => new m.DahuaScraper()),
  uniview: () => import('./scraper/uniview.js').then(m => new m.UniviewScraper()),
  // Tier 2 - Mixed
  hanwha: () => import('./scraper/hanwha.js').then(m => new m.HanwhaScraper()),
  ipro: () => import('./scraper/ipro.js').then(m => new m.IProScraper()),
  pelco: () => import('./scraper/pelco.js').then(m => new m.PelcoScraper()),
  vivotek: () => import('./scraper/vivotek.js').then(m => new m.VivotekScraper()),
  'march-networks': () => import('./scraper/march-networks.js').then(m => new m.MarchNetworksScraper()),
  // Tier 3 - JS-rendered (puppeteer)
  verkada: () => import('./scraper/verkada.js').then(m => new m.VerkadaScraper()),
  rhombus: () => import('./scraper/rhombus.js').then(m => new m.RhombusScraper()),
  avigilon: () => import('./scraper/avigilon.js').then(m => new m.AvigilonScraper()),
  bosch: () => import('./scraper/bosch.js').then(m => new m.BoschScraper()),
};

function parseArgs(): PipelineOptions {
  const args = process.argv.slice(2);
  const opts: PipelineOptions = {
    dryRun: false,
    outputDir: OUTPUT_DIR,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true;
    } else if (arg === '--manufacturer' || arg === '-m') {
      const next = args[++i];
      if (next) {
        opts.manufacturers = opts.manufacturers ?? [];
        opts.manufacturers.push(next.toLowerCase());
      }
    }
  }

  return opts;
}

function normalizeModel(model: string): string {
  return model.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function main() {
  const opts = parseArgs();
  const dateStr = new Date().toISOString().split('T')[0];

  console.log('=== AxisX Competitor Product Scraper ===\n');
  console.log(`Mode: ${opts.dryRun ? 'DRY RUN (no merge)' : 'LIVE (will merge)'}`);

  // Determine which scrapers to run
  const scraperNames = opts.manufacturers ?? Object.keys(SCRAPER_REGISTRY);
  const invalidNames = scraperNames.filter(n => !SCRAPER_REGISTRY[n]);
  if (invalidNames.length > 0) {
    console.error(`Unknown manufacturers: ${invalidNames.join(', ')}`);
    console.error(`Available: ${Object.keys(SCRAPER_REGISTRY).join(', ')}`);
    process.exit(1);
  }

  console.log(`Scrapers: ${scraperNames.join(', ')}\n`);

  // Ensure output directory exists
  mkdirSync(opts.outputDir, { recursive: true });

  // Run scrapers sequentially
  const allResults: ScrapeResult[] = [];

  for (const name of scraperNames) {
    try {
      const factory = SCRAPER_REGISTRY[name];
      if (!factory) continue;
      const scraper = await factory();
      const result = await scraper.run();
      allResults.push(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${name}] Failed to load scraper: ${msg}`);
      // Try fallback: check manual-data CSV
      console.log(`[${name}] Checking for manual data fallback...`);
    }
  }

  // Collect all scraped products
  const allProducts = allResults.flatMap(r => r.products);
  console.log(`\n--- Scrape Summary ---`);
  console.log(`Total products scraped: ${allProducts.length}`);
  for (const result of allResults) {
    console.log(`  ${result.manufacturer}: ${result.products.length} products, ${result.errors.length} errors`);
  }

  // Save raw scrape output
  const rawOutputPath = resolve(opts.outputDir, `scraped-${dateStr}.json`);
  writeFileSync(rawOutputPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\nRaw output: ${rawOutputPath}`);

  if (allProducts.length === 0) {
    console.log('\nNo products scraped. Nothing to map.');
    return;
  }

  // Map to Axis replacements
  console.log('\n--- Mapping to Axis replacements ---');
  const mapped = mapToAxis(allProducts);

  // Filter out already-known models
  const existingModels = loadExistingModels();
  const newMapped = mapped.filter(m => !existingModels.has(normalizeModel(m.competitor_model)));
  console.log(`New models (not in crossref): ${newMapped.length} of ${mapped.length}`);

  // Validate
  const validation = validateMappedProducts(newMapped);
  console.log(`Valid: ${validation.valid.length}, Invalid: ${validation.invalid.length}`);

  if (validation.warnings.length > 0 && opts.verbose) {
    console.log('\nWarnings:');
    for (const w of validation.warnings) {
      console.log(`  ${w}`);
    }
  }

  // Save mapped output
  const mappedOutputPath = resolve(opts.outputDir, `mapped-${dateStr}.json`);
  writeFileSync(mappedOutputPath, JSON.stringify(validation.valid, null, 2), 'utf-8');
  console.log(`Mapped output: ${mappedOutputPath}`);

  // Merge into crossref (unless dry run)
  if (!opts.dryRun && validation.valid.length > 0) {
    console.log('\n--- Merging into crossref_data.json ---');
    const crossref = JSON.parse(readFileSync(CROSSREF_PATH, 'utf-8'));

    const existingSet = new Set(
      crossref.mappings.map((m: { competitor_model: string }) => normalizeModel(m.competitor_model))
    );

    let added = 0;
    for (const product of validation.valid) {
      if (!existingSet.has(normalizeModel(product.competitor_model))) {
        crossref.mappings.push(product);
        existingSet.add(normalizeModel(product.competitor_model));
        added++;
      }
    }

    // Sort
    crossref.mappings.sort((a: { competitor_manufacturer: string; competitor_model: string }, b: { competitor_manufacturer: string; competitor_model: string }) => {
      const mfr = a.competitor_manufacturer.localeCompare(b.competitor_manufacturer);
      return mfr !== 0 ? mfr : a.competitor_model.localeCompare(b.competitor_model);
    });

    // Update metadata
    crossref.metadata = {
      ...crossref.metadata,
      last_updated: dateStr,
      total_mappings: crossref.mappings.length,
      source: `${crossref.metadata?.source ?? ''} + scrape ${dateStr}`.trim(),
    };

    writeFileSync(CROSSREF_PATH, JSON.stringify(crossref, null, 2) + '\n', 'utf-8');
    console.log(`Added ${added} new entries. Total: ${crossref.mappings.length}`);
  } else if (opts.dryRun) {
    console.log('\n[DRY RUN] Skipping merge into crossref_data.json');
  }

  // Final report
  console.log('\n=== Pipeline Complete ===');
  const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);
  console.log(`Products scraped: ${allProducts.length}`);
  console.log(`New models mapped: ${newMapped.length}`);
  console.log(`Valid for merge: ${validation.valid.length}`);
  console.log(`Errors: ${totalErrors}`);
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
