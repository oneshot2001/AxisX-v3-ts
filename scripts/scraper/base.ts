/**
 * Base scraper class with rate limiting, retry logic, and HTML parsing
 */

import * as cheerio from 'cheerio';
import PQueue from 'p-queue';
import type { ScrapedProduct, ScraperConfig, ScrapeResult, ScrapeError } from './types.js';

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected queue: PQueue;
  protected errors: ScrapeError[] = [];

  constructor(config: ScraperConfig) {
    this.config = config;
    // Convert requests/minute to concurrency + interval
    const intervalMs = (60 * 1000) / config.rateLimit;
    this.queue = new PQueue({
      concurrency: 1,
      interval: intervalMs,
      intervalCap: 1,
    });
  }

  /**
   * Each manufacturer implements this to scrape their product catalog
   */
  abstract scrape(): Promise<ScrapedProduct[]>;

  /**
   * Rate-limited HTTP fetch with retry
   */
  protected async fetch(url: string): Promise<string> {
    return this.queue.add(async () => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= this.config.retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await globalThis.fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'AxisX-CrossRef-Bot/4.0 (security-camera-comparison-tool)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.text();
        } catch (err) {
          lastError = err as Error;
          if (attempt < this.config.retries) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await this.sleep(delay);
          }
        }
      }

      this.errors.push({
        url,
        message: lastError?.message ?? 'Unknown error',
        code: 'FETCH_FAILED',
      });
      throw lastError;
    }) as Promise<string>;
  }

  /**
   * Parse HTML with cheerio
   */
  protected parseHtml(html: string) {
    return cheerio.load(html);
  }

  /**
   * Normalize camera type strings to consistent values
   */
  protected normalizeType(raw: string): string {
    const lower = raw.toLowerCase().trim();

    if (lower.includes('ptz')) return 'PTZ';
    if (lower.includes('panoramic') || lower.includes('multi-sensor') || lower.includes('multisensor')) return 'Panoramic';
    if (lower.includes('bullet')) return 'Bullet';
    if (lower.includes('turret')) return 'Turret';
    if (lower.includes('dome') && lower.includes('speed')) return 'PTZ';
    if (lower.includes('dome')) return 'Dome';
    if (lower.includes('box') || lower.includes('cube')) return 'Box';
    if (lower.includes('fisheye')) return 'Fisheye';
    if (lower.includes('thermal')) return 'Thermal';
    if (lower.includes('intercom') || lower.includes('door')) return 'Door Station';
    if (lower.includes('encoder')) return 'Encoder';
    if (lower.includes('nvr') || lower.includes('recorder')) return 'NVR';

    return raw.trim();
  }

  /**
   * Normalize resolution strings
   */
  protected normalizeResolution(raw: string): string {
    const lower = raw.toLowerCase().trim();

    if (lower.includes('8mp') || lower.includes('4k') || lower.includes('3840')) return '4K';
    if (lower.includes('6mp')) return '6MP';
    if (lower.includes('5mp') || lower.includes('2560x1920')) return '5MP';
    if (lower.includes('4mp') || lower.includes('2560x1440') || lower.includes('2688')) return '4MP';
    if (lower.includes('3mp')) return '3MP';
    if (lower.includes('2mp') || lower.includes('1080p') || lower.includes('1920x1080')) return '1080p';
    if (lower.includes('1.3mp') || lower.includes('720p') || lower.includes('1280x720')) return '720p';
    if (lower.includes('12mp')) return '12MP';

    return raw.trim();
  }

  /**
   * Execute the scraper and return results
   */
  async run(): Promise<ScrapeResult> {
    const start = Date.now();
    console.log(`[${this.config.name}] Starting scrape of ${this.config.manufacturer}...`);

    let products: ScrapedProduct[] = [];

    try {
      products = await this.scrape();
      console.log(`[${this.config.name}] Found ${products.length} products`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${this.config.name}] Fatal error: ${msg}`);
      this.errors.push({
        url: this.config.baseUrl,
        message: msg,
        code: 'SCRAPE_FAILED',
      });
    }

    const duration = Date.now() - start;
    console.log(`[${this.config.name}] Completed in ${(duration / 1000).toFixed(1)}s (${products.length} products, ${this.errors.length} errors)`);

    return {
      manufacturer: this.config.manufacturer,
      products,
      errors: [...this.errors],
      duration,
      timestamp: new Date().toISOString(),
    };
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
