/**
 * Combined Axis Product Enrichment Scraper
 *
 * Visits each camera product page on Axis.com once and extracts:
 *   Pass 1: Specifications tab → enriches axis_spec_data.json
 *   Pass 2: Accessories tab  → builds accessory_compatibility.json
 *
 * Usage:
 *   npm run scrape:axis                          # Full run, both passes
 *   npm run scrape:axis -- --model P3285-LVE     # Single model
 *   npm run scrape:axis -- --series P32           # All models in a series
 *   npm run scrape:axis -- --specs-only           # Only spec enrichment
 *   npm run scrape:axis -- --accessories-only     # Only accessories
 *   npm run scrape:axis -- --dry-run              # Preview without writing
 *   npm run scrape:axis -- --validate             # Compare against live
 *   npm run scrape:axis -- --audit                # Report data gaps
 *   npm run scrape:axis -- --concurrency 3        # Max concurrent pages (default 3)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser, Page } from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const SPEC_DATA_PATH = resolve(PROJECT_ROOT, 'src/data/axis_spec_data.json');
const ACCESSORY_OUTPUT_PATH = resolve(PROJECT_ROOT, 'src/data/accessory_compatibility.json');
const CACHE_DIR = resolve(__dirname, '../output/.scrape-cache');

// ─── Types ───────────────────────────────────────────────────────────────────

interface CLIOptions {
  model?: string;
  series?: string;
  specsOnly: boolean;
  accessoriesOnly: boolean;
  dryRun: boolean;
  validate: boolean;
  audit: boolean;
  concurrency: number;
  verbose: boolean;
  useCache: boolean;
}

interface ScrapedSpec {
  maxResolution?: string;
  resolutionPixels?: string;
  resolutionLabel?: string;
  maxFps?: number;
  codecs?: string[];
  powerType?: string;
  maxPowerWatts?: number;
  poeStandard?: string;
  poeTypeClass?: string;
  typicalPowerWatts?: number;
  powerFeatures?: string[];
  chipset?: string;
  hasDLPU?: boolean;
  sensor?: string;
}

interface ScrapedAccessory {
  model: string;
  displayName: string;
  description: string;
  accessoryType: string;
  mountPlacement?: string;
  recommendation: 'recommended' | 'included' | 'compatible';
  requiresAdditional: boolean;
  msrpKey: string;
}

interface ScrapeResult {
  modelKey: string;
  specs: ScrapedSpec | null;
  accessories: ScrapedAccessory[];
  error?: string;
  durationMs: number;
}

// ─── Mount Placement Inference ───────────────────────────────────────────────

const MOUNT_NAME_TO_PLACEMENT: Record<string, string> = {
  'pole mount': 'pole',
  'wall mount': 'wall',
  'ceiling mount': 'ceiling',
  'telescopic ceiling mount': 'ceiling',
  'corner bracket': 'corner',
  'corner mount': 'corner',
  'parapet mount': 'parapet',
  'telescopic parapet mount': 'parapet',
  'recessed mount': 'recessed',
  'pendant': 'pendant',
  'pendant kit': 'pendant',
  'pendant wall mount': 'pendant',
  'tile grid ceiling mount': 'ceiling',
  'lighting track mount': 'ceiling',
  'wall and pole mount': 'wall',
};

function inferMountPlacement(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [pattern, placement] of Object.entries(MOUNT_NAME_TO_PLACEMENT)) {
    if (lower.includes(pattern)) return placement;
  }
  return undefined;
}

// ─── Accessory Type Inference ────────────────────────────────────────────────

function inferAccessoryType(name: string, filterCategory?: string): string {
  if (filterCategory) {
    const lower = filterCategory.toLowerCase();
    if (lower.includes('mount')) return 'mount';
    if (lower.includes('cable') || lower.includes('connector')) return 'cables-connectors';
    if (lower.includes('storage')) return 'edge-storage';
    if (lower.includes('housing') || lower.includes('cabinet')) return 'housings-cabinets';
    if (lower.includes('i/o') || lower.includes('io')) return 'io-devices';
    if (lower.includes('power')) return 'power';
    if (lower.includes('switch')) return 'switches';
    if (lower.includes('tool') || lower.includes('extra')) return 'tools-extras';
  }

  const lower = name.toLowerCase();
  if (lower.includes('mount') || lower.includes('bracket') || lower.includes('pendant')) return 'mount';
  if (lower.includes('cable') || lower.includes('connector')) return 'cables-connectors';
  if (lower.includes('card') || lower.includes('storage')) return 'edge-storage';
  if (lower.includes('housing') || lower.includes('cabinet') || lower.includes('cover')) return 'housings-cabinets';
  if (lower.includes('relay') || lower.includes('i/o')) return 'io-devices';
  if (lower.includes('midspan') || lower.includes('poe') || lower.includes('power')) return 'power';
  if (lower.includes('switch')) return 'switches';
  return 'tools-extras';
}

// ─── URL Construction ────────────────────────────────────────────────────────

function modelToUrl(modelKey: string): string {
  // Normalize: lowercase, replace spaces with hyphens, strip variant suffixes
  const normalized = modelKey
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
  return `https://www.axis.com/products/axis-${normalized}`;
}

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const opts: CLIOptions = {
    specsOnly: false,
    accessoriesOnly: false,
    dryRun: false,
    validate: false,
    audit: false,
    concurrency: 3,
    verbose: false,
    useCache: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--model':
        opts.model = args[++i];
        break;
      case '--series':
        opts.series = args[++i];
        break;
      case '--specs-only':
        opts.specsOnly = true;
        break;
      case '--accessories-only':
        opts.accessoriesOnly = true;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--validate':
        opts.validate = true;
        break;
      case '--audit':
        opts.audit = true;
        break;
      case '--concurrency':
        opts.concurrency = parseInt(args[++i], 10) || 3;
        break;
      case '--verbose':
      case '-v':
        opts.verbose = true;
        break;
      case '--cache':
        opts.useCache = true;
        break;
    }
  }

  return opts;
}

// ─── Audit Mode ──────────────────────────────────────────────────────────────

function runAudit(specData: Record<string, any>): void {
  const products = specData.products;
  const cameras = Object.values(products).filter(
    (p: any) => p.productType === 'camera'
  ) as any[];

  const total = cameras.length;
  const fields = [
    'maxResolution',
    'maxFps',
    'codecs',
    'powerType',
    'maxPowerWatts',
    'sensor',
    'chipset',
  ];

  console.log(`\n=== Data Gap Audit ===`);
  console.log(`Total cameras: ${total}\n`);

  for (const field of fields) {
    let populated = 0;
    for (const cam of cameras) {
      const val = cam[field];
      if (field === 'codecs') {
        if (Array.isArray(val) && val.length > 0) populated++;
      } else if (field === 'chipset') {
        if (val && typeof val === 'object' && val.chipset) populated++;
      } else {
        if (val !== null && val !== undefined && val !== '' && val !== '-') populated++;
      }
    }
    const pct = ((populated / total) * 100).toFixed(1);
    const gap = total - populated;
    console.log(`  ${field}: ${populated}/${total} (${pct}%) — ${gap} missing`);
  }

  // New enrichment fields
  const newFields = [
    'resolutionPixels',
    'resolutionLabel',
    'poeStandard',
    'poeTypeClass',
    'typicalPowerWatts',
  ];
  console.log('\n  --- Enrichment fields (new) ---');
  for (const field of newFields) {
    let populated = 0;
    for (const cam of cameras) {
      if (cam[field] !== undefined && cam[field] !== null) populated++;
    }
    const pct = ((populated / total) * 100).toFixed(1);
    console.log(`  ${field}: ${populated}/${total} (${pct}%)`);
  }

  console.log('');
}

// ─── Page Scraping ───────────────────────────────────────────────────────────

async function scrapeSpecsFromPage(page: Page, verbose: boolean): Promise<ScrapedSpec> {
  const specs: ScrapedSpec = {};

  try {
    // Axis.com uses a single long page with sections. Specs are in tables
    // under H2 "Technical specifications" with class ac-table.
    // Each table has a caption ("Camera", "Video", "Lens", "Power", etc.)
    // and rows with: td.ac-table__cell--first (label) + td.ac-table__cell--centered (value)

    const rawSpecs = await page.evaluate(() => {
      const pairs: Record<string, string> = {};

      // Find the spec section by locating the H2
      const specH2 = Array.from(document.querySelectorAll('h2')).find(
        h => h.textContent?.trim().toLowerCase().includes('technical specifications')
      );
      if (!specH2) return { pairs, fullText: '' };

      const section = specH2.closest('section') || specH2.parentElement;
      if (!section) return { pairs, fullText: '' };

      // Extract from all ac-table rows
      const tables = section.querySelectorAll('table.ac-table');
      tables.forEach(table => {
        const caption = table.querySelector('caption')?.textContent?.trim().toLowerCase() || '';
        const rows = table.querySelectorAll('tr.ac-table__row');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const label = cells[0].textContent?.trim().toLowerCase() || '';
            const value = cells[1].textContent?.trim() || '';
            if (label && value && label !== 'property description') {
              // Prefix with table caption for disambiguation
              pairs[`${caption}:${label}`] = value;
              // Also store without prefix for simple lookups
              if (!pairs[label]) pairs[label] = value;
            }
          }
        });
      });

      const fullText = section.textContent || '';
      return { pairs, fullText };
    });

    const pairs = rawSpecs.pairs;
    const pairCount = Object.keys(pairs).length;
    if (verbose && pairCount > 0) {
      console.log(`    [specs] Found ${pairCount} property pairs`);
    }

    // Parse resolution
    const resText =
      findValue(pairs, ['max video resolution', 'video:max video resolution', 'camera:max resolution']);
    if (resText) {
      const pixelMatch = resText.match(/(\d{3,5})\s*(?:×|x)\s*(\d{3,5})/);
      if (pixelMatch) {
        specs.resolutionPixels = `${pixelMatch[1]}x${pixelMatch[2]}`;
        const w = parseInt(pixelMatch[1], 10);
        const h = parseInt(pixelMatch[2], 10);
        const mp = Math.round((w * h) / 1000000);
        specs.maxResolution = `${mp} MP`;
        if (w >= 3840) specs.resolutionLabel = '4K UHD';
        else if (w >= 2560 && h >= 1920) specs.resolutionLabel = '5 MP';
        else if (w >= 2560) specs.resolutionLabel = '2K QHD';
        else if (w >= 1920) specs.resolutionLabel = 'HDTV 1080p';
        else if (w >= 1280) specs.resolutionLabel = 'HDTV 720p';
      }
    }

    // Parse FPS — Axis format is "50/60" meaning 50fps (PAL) or 60fps (NTSC)
    const fpsText =
      findValue(pairs, ['max frames per second', 'video:max frames per second', 'max fps']);
    if (fpsText) {
      // "50/60" → take the higher value (60)
      const numbers = fpsText.match(/\d+/g);
      if (numbers) {
        specs.maxFps = Math.max(...numbers.map(Number));
      }
    }

    // Parse codecs — Axis uses separate rows per codec in the Compression table
    // Keys like "compression:h.264", "compression:h.265", "compression:av1", "compression:mjpeg"
    const codecs: string[] = [];

    // Check individual codec rows (Axis format: each codec is its own row with value like "Yes", "On", "Baseline, High, Main")
    if (findValue(pairs, ['compression:h.265', 'h.265'])) codecs.push('H.265');
    if (findValue(pairs, ['compression:h.264', 'h.264'])) codecs.push('H.264');
    if (findValue(pairs, ['compression:av1', 'av1'])) codecs.push('AV1');
    if (findValue(pairs, ['compression:mjpeg', 'mjpeg'])) codecs.push('MJPEG');

    // Fallback: single "video compression" field listing all codecs
    if (codecs.length === 0) {
      const codecText = findValue(pairs, ['video compression', 'video:video compression']);
      if (codecText) {
        if (/H\.?265|HEVC/i.test(codecText)) codecs.push('H.265');
        if (/H\.?264|AVC/i.test(codecText)) codecs.push('H.264');
        if (/AV1/i.test(codecText)) codecs.push('AV1');
        if (/MJPEG/i.test(codecText)) codecs.push('MJPEG');
      }
    }
    if (codecs.length > 0) specs.codecs = codecs;

    // Parse power — check Power table, Network table, and full text
    const powerText =
      findValue(pairs, ['power:power', 'power', 'power supply', 'power over ethernet']);
    const fullText = rawSpecs.fullText;

    // Also check Network table for PoE class (Axis often puts it there)
    const poeClassText = findValue(pairs, ['network:poe class', 'poe class']);

    if (powerText || poeClassText || fullText) {
      const combined = `${powerText || ''} ${poeClassText ? ' PoE Class ' + poeClassText : ''} ${fullText}`;

      // PoE standard (e.g., "IEEE 802.3af", "802.3at")
      const poeStdMatch = combined.match(/IEEE\s*802\.3(af|at|bt)/i);
      if (poeStdMatch) {
        specs.poeStandard = `IEEE 802.3${poeStdMatch[1].toLowerCase()}`;
        specs.powerType = 'PoE';
      } else if (poeClassText || /PoE/i.test(combined)) {
        specs.powerType = 'PoE';
      }

      // PoE type/class — from dedicated "PoE Class" field or text pattern
      if (poeClassText) {
        const classNum = poeClassText.match(/(\d+)/);
        if (classNum) {
          specs.poeTypeClass = `Class ${classNum[1]}`;
        }
      }
      if (!specs.poeTypeClass) {
        const poeClassMatch = combined.match(/(?:Type\s*(\d+)\s*)?Class\s*(\d+)/i);
        if (poeClassMatch) {
          const type = poeClassMatch[1] ? `Type ${poeClassMatch[1]} ` : '';
          specs.poeTypeClass = `${type}Class ${poeClassMatch[2]}`;
        }
      }

      // Max power (e.g., "max 12.5 W", "Maximum 12.5W")
      const maxWText = findValue(pairs, ['power:max power consumption', 'max power consumption', 'power:max. power', 'power:max power']);
      if (maxWText) {
        const wMatch = maxWText.match(/(\d+(?:\.\d+)?)\s*W/i);
        if (wMatch) specs.maxPowerWatts = parseFloat(wMatch[1]);
      } else {
        const maxWMatch = combined.match(/max(?:imum|\.?)?\s*(?:power\s*)?(\d+(?:\.\d+)?)\s*W/i);
        if (maxWMatch) specs.maxPowerWatts = parseFloat(maxWMatch[1]);
      }

      // Typical power (e.g., "typical 5.5 W")
      const typicalText = findValue(pairs, ['power:typical power consumption', 'typical power consumption']);
      if (typicalText) {
        const tMatch = typicalText.match(/(\d+(?:\.\d+)?)\s*W/i);
        if (tMatch) specs.typicalPowerWatts = parseFloat(tMatch[1]);
      } else {
        const typicalMatch = combined.match(/typical\s*(?:\([^)]*\)\s*)?(\d+(?:\.\d+)?)\s*W/i);
        if (typicalMatch) specs.typicalPowerWatts = parseFloat(typicalMatch[1]);
      }

      // Power features
      const features: string[] = [];
      if (/power\s*meter/i.test(combined)) features.push('power meter');
      if (/power\s*redundancy/i.test(combined)) features.push('power redundancy');
      if (features.length > 0) specs.powerFeatures = features;
    }

    // Parse chipset
    const chipsetText =
      findValue(pairs, ['general:chipset', 'chipset', 'general:soc', 'soc', 'processor']);
    if (chipsetText) {
      specs.chipset = chipsetText;
      specs.hasDLPU = /DLPU/i.test(chipsetText) || /ARTPEC-[89]/i.test(chipsetText);
    } else {
      const artpecMatch = fullText.match(/ARTPEC-(\d+)/i);
      if (artpecMatch) {
        specs.chipset = `ARTPEC-${artpecMatch[1]}`;
        specs.hasDLPU = parseInt(artpecMatch[1], 10) >= 8;
      }
    }

    // Parse sensor — combine sensor type with size for useful value
    const sensorText =
      findValue(pairs, ['camera:image sensor', 'image sensor', 'sensor']);
    const sensorSize =
      findValue(pairs, ['camera:image sensor size', 'image sensor size']);
    if (sensorText && sensorText.length < 100) {
      // Combine "CMOS" with "1/2.8"" → "1/2.8\" CMOS"
      if (sensorSize && sensorText.toUpperCase() === 'CMOS') {
        specs.sensor = `${sensorSize} ${sensorText}`;
      } else {
        specs.sensor = sensorText;
      }
    }
  } catch (err) {
    if (verbose) console.log(`    [specs] Error: ${(err as Error).message}`);
  }

  return specs;
}

async function scrapeAccessoriesFromPage(
  page: Page,
  verbose: boolean
): Promise<ScrapedAccessory[]> {
  const accessories: ScrapedAccessory[] = [];

  try {
    // Axis.com shows accessories in the "Accessories" section with H3 category
    // headings (e.g., "Cables & connectors", "Mounts", "Power") and
    // a.accessory-card elements (NOT .compatible-analytic-card which are analytics).
    // Each card has: .accessory-card__text > h4 (name) + span (description)
    // Badge: span.accessory-card__included ("Included with this product")
    // or "Recommended for this product" text within the card.

    const rawAccessories = await page.evaluate(() => {
      const items: Array<{
        name: string;
        description: string;
        isRecommended: boolean;
        isIncluded: boolean;
        requiresAdditional: boolean;
        category: string;
      }> = [];

      // Find the Accessories section
      const accH2 = Array.from(document.querySelectorAll('h2')).find(
        h => h.textContent?.trim() === 'Accessories'
      );
      if (!accH2) return items;

      const accSection = accH2.closest('section') || accH2.parentElement;
      if (!accSection) return items;

      // Build a map: walk all direct children of the accessory section in DOM order.
      // Track the current H3 category heading. Each card inherits the most recent H3.
      // The DOM structure is: H3 heading → container/grid → accessory-card elements
      let currentCategory = '';
      const allElements = accSection.querySelectorAll('*');

      allElements.forEach(el => {
        // Track H3 category headings
        if (el.tagName === 'H3') {
          currentCategory = el.textContent?.trim() || '';
          return;
        }

        // Process accessory cards (skip analytics cards)
        if (el.tagName === 'A' &&
            el.classList.contains('accessory-card') &&
            !el.classList.contains('compatible-analytic-card')) {
          const h4 = el.querySelector('h4');
          const name = h4?.textContent?.trim();
          if (!name || name.length < 3) return;

          // Description is the span sibling of h4 inside .accessory-card__text
          const textDiv = el.querySelector('.accessory-card__text');
          const descSpan = textDiv?.querySelector('span:not(.accessory-card__included):not(.accessory-card__recommended)');
          const description = descSpan?.textContent?.trim() || '';

          const fullText = el.textContent || '';
          const isRecommended = /recommended\s+for\s+this\s+product/i.test(fullText);
          const isIncluded = /included\s+with\s+this\s+product/i.test(fullText);
          const requiresAdditional = /requires\s+additional/i.test(fullText);

          items.push({ name, description, isRecommended, isIncluded, requiresAdditional, category: currentCategory });
        }
      });

      return items;
    });

    if (verbose) {
      console.log(`    [accessories] Found ${rawAccessories.length} items`);
    }

    // Process raw accessories
    const seen = new Set<string>();
    for (const raw of rawAccessories) {
      // Extract model from name: "AXIS T91B47 Pole Mount" → "T91B47"
      // Also handle: "AXIS Surveillance Card 1 TB", "Network Cable Coupler IP66"
      const modelMatch = raw.name.match(/AXIS\s+([A-Z]{1,3}[A-Z0-9]{2,}[A-Z0-9-]*)/i);
      const model = modelMatch ? modelMatch[1].toUpperCase() : raw.name.replace(/^AXIS\s+/i, '').toUpperCase().replace(/\s+/g, '-').slice(0, 30);

      if (seen.has(model)) continue;
      seen.add(model);

      const accessoryType = inferAccessoryType(raw.name, raw.category);
      const mountPlacement =
        accessoryType === 'mount' ? inferMountPlacement(raw.name) : undefined;

      const recommendation: 'recommended' | 'included' | 'compatible' = raw.isIncluded
        ? 'included'
        : raw.isRecommended
          ? 'recommended'
          : 'compatible';

      const msrpKey = model.replace(/\s+/g, '-');

      accessories.push({
        model: msrpKey,
        displayName: raw.name.replace(/\s+/g, ' ').trim(),
        description: raw.description.replace(/\s+/g, ' ').trim(),
        accessoryType,
        mountPlacement,
        recommendation,
        requiresAdditional: raw.requiresAdditional,
        msrpKey,
      });
    }
  } catch (err) {
    if (verbose) console.log(`    [accessories] Error: ${(err as Error).message}`);
  }

  return accessories;
}

async function scrapeSingleModel(
  browser: Browser,
  modelKey: string,
  opts: CLIOptions
): Promise<ScrapeResult> {
  const start = performance.now();
  const url = modelToUrl(modelKey);
  const result: ScrapeResult = {
    modelKey,
    specs: null,
    accessories: [],
    durationMs: 0,
  };

  let page: Page | null = null;

  try {
    page = await browser.newPage();
    await page.setUserAgent('AxisX-CrossRef-Tool/3.0 (product-data-update)');
    await page.setViewport({ width: 1280, height: 800 });

    // Check cache first
    if (opts.useCache) {
      const cached = loadCache(modelKey);
      if (cached) {
        if (opts.verbose) console.log(`  [${modelKey}] Using cached data`);
        result.specs = cached.specs;
        result.accessories = cached.accessories;
        result.durationMs = performance.now() - start;
        return result;
      }
    }

    if (opts.verbose) console.log(`  [${modelKey}] → ${url}`);

    // Navigate to product page
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    if (!response || response.status() >= 400) {
      result.error = `HTTP ${response?.status() ?? 'unknown'}`;
      result.durationMs = performance.now() - start;
      return result;
    }

    // Pass 1: Specifications
    if (!opts.accessoriesOnly) {
      result.specs = await scrapeSpecsFromPage(page, opts.verbose);
    }

    // Pass 2: Accessories
    if (!opts.specsOnly) {
      result.accessories = await scrapeAccessoriesFromPage(page, opts.verbose);
    }

    // Cache the result
    if (opts.useCache) {
      saveCache(modelKey, result);
    }
  } catch (err) {
    result.error = (err as Error).message;
  } finally {
    await page?.close().catch(() => {});
  }

  result.durationMs = performance.now() - start;
  return result;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

function getCachePath(modelKey: string): string {
  return resolve(CACHE_DIR, `${modelKey.replace(/[^a-zA-Z0-9-]/g, '_')}.json`);
}

function loadCache(modelKey: string): { specs: ScrapedSpec | null; accessories: ScrapedAccessory[] } | null {
  const cachePath = getCachePath(modelKey);
  if (!existsSync(cachePath)) return null;
  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf8'));
    // Cache valid for 7 days
    if (Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function saveCache(modelKey: string, result: ScrapeResult): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = getCachePath(modelKey);
  writeFileSync(
    cachePath,
    JSON.stringify({ timestamp: Date.now(), data: { specs: result.specs, accessories: result.accessories } })
  );
}

// ─── Spec Merge ──────────────────────────────────────────────────────────────

function mergeSpecData(existing: Record<string, any>, scraped: ScrapedSpec): Record<string, any> {
  const merged = { ...existing };

  // Gap-fill only — never overwrite existing good data
  if (!existing.maxResolution && scraped.maxResolution) {
    merged.maxResolution = scraped.maxResolution;
  }
  if (!existing.maxFps && scraped.maxFps) {
    merged.maxFps = scraped.maxFps;
  }
  if ((!existing.codecs || existing.codecs.length === 0) && scraped.codecs && scraped.codecs.length > 0) {
    merged.codecs = scraped.codecs;
  }
  if (!existing.powerType && scraped.powerType) {
    merged.powerType = scraped.powerType;
  }
  if (!existing.maxPowerWatts && scraped.maxPowerWatts) {
    merged.maxPowerWatts = scraped.maxPowerWatts;
  }
  if (existing.chipset && !existing.chipset.chipset && scraped.chipset) {
    merged.chipset = {
      ...existing.chipset,
      chipset: scraped.chipset,
      hasDLPU: scraped.hasDLPU ?? existing.chipset.hasDLPU,
      generation: scraped.chipset.match(/ARTPEC-\d+/)?.[0] ?? existing.chipset.generation,
    };
  }
  if (!existing.sensor && scraped.sensor) {
    merged.sensor = scraped.sensor;
  }

  // NEW fields — always write from scrape (no existing data to conflict with)
  if (scraped.resolutionPixels) merged.resolutionPixels = scraped.resolutionPixels;
  if (scraped.resolutionLabel) merged.resolutionLabel = scraped.resolutionLabel;
  if (scraped.poeStandard) merged.poeStandard = scraped.poeStandard;
  if (scraped.poeTypeClass) merged.poeTypeClass = scraped.poeTypeClass;
  if (scraped.typicalPowerWatts) merged.typicalPowerWatts = scraped.typicalPowerWatts;
  if (scraped.powerFeatures && scraped.powerFeatures.length > 0) {
    merged.powerFeatures = scraped.powerFeatures;
  }

  return merged;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findValue(pairs: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    // Direct match
    if (pairs[key]) return pairs[key];
    // Partial match
    for (const [k, v] of Object.entries(pairs)) {
      if (k.includes(key)) return v;
    }
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  const specData = JSON.parse(readFileSync(SPEC_DATA_PATH, 'utf8'));
  const products = specData.products as Record<string, any>;

  console.log('=== Axis Product Enrichment Scraper ===\n');

  // Audit mode — report and exit
  if (opts.audit) {
    runAudit(specData);
    return;
  }

  // Filter cameras to scrape
  let cameraKeys = Object.keys(products).filter(
    (k) => products[k].productType === 'camera'
  );

  if (opts.model) {
    const target = opts.model.toUpperCase();
    cameraKeys = cameraKeys.filter((k) => k.toUpperCase() === target);
    if (cameraKeys.length === 0) {
      console.error(`Model "${opts.model}" not found in spec data.`);
      process.exit(1);
    }
  } else if (opts.series) {
    const prefix = opts.series.toUpperCase();
    cameraKeys = cameraKeys.filter((k) => k.toUpperCase().startsWith(prefix));
    if (cameraKeys.length === 0) {
      console.error(`No cameras found matching series "${opts.series}".`);
      process.exit(1);
    }
  }

  const mode = opts.specsOnly ? 'specs-only' : opts.accessoriesOnly ? 'accessories-only' : 'both';
  console.log(`Mode: ${mode}`);
  console.log(`Cameras: ${cameraKeys.length}`);
  console.log(`Concurrency: ${opts.concurrency}`);
  console.log(`Dry run: ${opts.dryRun}`);
  console.log(`Cache: ${opts.useCache}`);
  console.log('');

  // Launch browser
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const results: ScrapeResult[] = [];
  let completed = 0;
  let errors = 0;
  const totalStart = performance.now();

  // Process cameras in batches with controlled concurrency
  for (let i = 0; i < cameraKeys.length; i += opts.concurrency) {
    const batch = cameraKeys.slice(i, i + opts.concurrency);
    const batchResults = await Promise.all(
      batch.map((key) => scrapeSingleModel(browser, key, opts))
    );

    for (const result of batchResults) {
      results.push(result);
      completed++;

      if (result.error) {
        errors++;
        console.log(
          `  [${completed}/${cameraKeys.length}] ✗ ${result.modelKey}: ${result.error}`
        );
      } else {
        const specCount = result.specs
          ? Object.values(result.specs).filter((v) => v !== undefined && v !== null).length
          : 0;
        console.log(
          `  [${completed}/${cameraKeys.length}] ✓ ${result.modelKey} — ${specCount} specs, ${result.accessories.length} accessories (${(result.durationMs / 1000).toFixed(1)}s)`
        );
      }
    }

    // Rate limiting: 2s delay between batches
    if (i + opts.concurrency < cameraKeys.length) {
      await sleep(2000);
    }
  }

  await browser.close();

  const totalDuration = (performance.now() - totalStart) / 1000;
  console.log(`\nCompleted ${completed} cameras in ${totalDuration.toFixed(1)}s (${errors} errors)`);

  if (opts.dryRun) {
    console.log('\n[DRY RUN] No files written.');
    printSummary(results);
    return;
  }

  // ─── Write spec enrichment ───────────────────────────────────────────────

  if (!opts.accessoriesOnly) {
    let specUpdates = 0;
    for (const result of results) {
      if (!result.specs) continue;
      const existing = products[result.modelKey];
      if (!existing) continue;

      const merged = mergeSpecData(existing, result.specs);
      // Only update if something changed
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        products[result.modelKey] = merged;
        specUpdates++;
      }
    }

    if (specUpdates > 0) {
      writeFileSync(SPEC_DATA_PATH, JSON.stringify(specData, null, 2) + '\n');
      console.log(`\n✓ Updated axis_spec_data.json (${specUpdates} products enriched)`);
    } else {
      console.log('\n— No spec changes to write');
    }
  }

  // ─── Write accessory compatibility ─────────────────────────────────────────

  if (!opts.specsOnly) {
    const compatibility: Record<string, any> = {};
    let totalAccessories = 0;

    for (const result of results) {
      if (result.accessories.length === 0) continue;
      compatibility[result.modelKey] = {
        productVariant: products[result.modelKey]?.displayName || result.modelKey,
        accessories: result.accessories,
      };
      totalAccessories += result.accessories.length;
    }

    const accessoryDb = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalMappings: Object.keys(compatibility).length,
      compatibility,
    };

    writeFileSync(ACCESSORY_OUTPUT_PATH, JSON.stringify(accessoryDb, null, 2) + '\n');
    console.log(
      `✓ Generated accessory_compatibility.json (${Object.keys(compatibility).length} cameras, ${totalAccessories} accessories)`
    );
  }

  printSummary(results);
}

function printSummary(results: ScrapeResult[]): void {
  const withSpecs = results.filter((r) => r.specs && Object.values(r.specs).some((v) => v !== undefined)).length;
  const withAccessories = results.filter((r) => r.accessories.length > 0).length;
  const totalAccessories = results.reduce((sum, r) => sum + r.accessories.length, 0);
  const avgAccessories = withAccessories > 0 ? (totalAccessories / withAccessories).toFixed(1) : '0';
  const errorCount = results.filter((r) => r.error).length;

  console.log('\n=== Summary ===');
  console.log(`  Total cameras scraped: ${results.length}`);
  console.log(`  With spec data: ${withSpecs}`);
  console.log(`  With accessories: ${withAccessories}`);
  console.log(`  Total accessory entries: ${totalAccessories}`);
  console.log(`  Avg accessories/camera: ${avgAccessories}`);
  console.log(`  Errors: ${errorCount}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
