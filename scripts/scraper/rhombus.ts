/**
 * Rhombus product scraper
 * Target: rhombus.com
 * Method: puppeteer (JS-rendered SPA)
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class RhombusScraper extends BaseScraper {
  constructor() {
    super({
      name: 'rhombus',
      manufacturer: 'Rhombus',
      baseUrl: 'https://www.rhombus.com/',
      rateLimit: 4,
      method: 'puppeteer',
      timeout: 30000,
      retries: 2,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    let browser;
    try {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setUserAgent('AxisX-CrossRef-Bot/4.0 (security-camera-comparison-tool)');

      try {
        await page.goto(this.config.baseUrl + 'cameras/', {
          waitUntil: 'networkidle2',
          timeout: this.config.timeout,
        });

        await page.waitForSelector('[class*="product"], [class*="camera"], [class*="card"]', {
          timeout: 10000,
        }).catch(() => {});

        const pageProducts = await page.evaluate(() => {
          const items: Array<{ model: string; desc: string; link: string }> = [];
          document.querySelectorAll('[class*="product"], [class*="camera"], [class*="card"]').forEach(el => {
            const title = el.querySelector('h2, h3, h4, [class*="title"], [class*="name"]');
            const desc = el.querySelector('p, [class*="desc"], [class*="specs"]');
            const anchor = el.querySelector('a');
            if (title?.textContent?.trim()) {
              items.push({
                model: title.textContent.trim(),
                desc: desc?.textContent?.trim() ?? '',
                link: anchor?.href ?? '',
              });
            }
          });
          return items;
        });

        for (const item of pageProducts) {
          if (!item.model.match(/^R\d/i)) continue;

          products.push({
            model: item.model,
            manufacturer: 'Rhombus',
            type: this.normalizeType(this.inferType(item.model, item.desc)),
            resolution: this.normalizeResolution(this.inferResolution(item.desc)),
            features: this.extractFeatures(item.desc),
            url: item.link || this.config.baseUrl,
          });
        }
      } catch {
        // Non-fatal
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.errors.push({ url: this.config.baseUrl, message: `Puppeteer error: ${msg}`, code: 'BROWSER_ERROR' });
    } finally {
      await browser?.close();
    }

    return products;
  }

  private inferType(model: string, desc: string): string {
    const combined = `${model} ${desc}`.toLowerCase();
    if (combined.includes('dome')) return 'Dome';
    if (combined.includes('bullet')) return 'Bullet';
    if (combined.includes('fisheye')) return 'Fisheye';
    return 'Dome'; // Rhombus primarily makes domes
  }

  private inferResolution(desc: string): string {
    const lower = desc.toLowerCase();
    if (lower.includes('8mp') || lower.includes('4k')) return '4K';
    if (lower.includes('5mp')) return '5MP';
    if (lower.includes('4mp')) return '4MP';
    if (lower.includes('2mp') || lower.includes('1080p')) return '1080p';
    return '1080p';
  }

  private extractFeatures(desc: string): string[] {
    const features: string[] = [];
    const lower = desc.toLowerCase();
    if (lower.includes('cloud')) features.push('Cloud-managed');
    if (lower.includes('ai') || lower.includes('analytics')) features.push('AI Analytics');
    if (lower.includes('ir') || lower.includes('night')) features.push('IR');
    return features;
  }
}
