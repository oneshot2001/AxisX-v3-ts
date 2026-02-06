/**
 * Bosch product scraper
 * Target: videoselector.boschsecurity.com
 * Method: puppeteer (JS-rendered product selector)
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class BoschScraper extends BaseScraper {
  constructor() {
    super({
      name: 'bosch',
      manufacturer: 'Bosch',
      baseUrl: 'https://www.boschsecurity.com/us/en/',
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

      const categoryUrls = [
        'products/video-systems/cameras/',
        'products/video-systems/ip-cameras/',
      ];

      for (const category of categoryUrls) {
        try {
          await page.goto(this.config.baseUrl + category, {
            waitUntil: 'networkidle2',
            timeout: this.config.timeout,
          });

          await page.waitForSelector('[class*="product"], [class*="camera"], [class*="card"]', {
            timeout: 10000,
          }).catch(() => {});

          const pageProducts = await page.evaluate(() => {
            const items: Array<{ model: string; desc: string; link: string }> = [];
            document.querySelectorAll('[class*="product"], [class*="camera"], [class*="card"], [class*="tile"]').forEach(el => {
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
            if (!item.model.match(/^(NDV|NDE|NDI|NBE|NBN|NDP|NDS|NCN)/i) && !item.model.toLowerCase().includes('flexidome') && !item.model.toLowerCase().includes('dinion')) continue;

            products.push({
              model: item.model,
              manufacturer: 'Bosch',
              type: this.normalizeType(this.inferType(item.model, item.desc)),
              resolution: this.normalizeResolution(this.inferResolution(item.desc)),
              features: this.extractFeatures(item.desc),
              url: item.link || this.config.baseUrl,
            });
          }

          await this.sleep(2000);
        } catch {
          // Non-fatal
        }
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
    if (combined.includes('ptz') || combined.includes('autodome')) return 'PTZ';
    if (combined.includes('bullet') || combined.includes('dinion')) return 'Bullet';
    if (combined.includes('dome') || combined.includes('flexidome')) return 'Dome';
    if (combined.includes('panoramic')) return 'Panoramic';
    return 'Camera';
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
    if (lower.includes('starlight')) features.push('Starlight');
    if (lower.includes('essential analytics')) features.push('Essential Analytics');
    if (lower.includes('wdr')) features.push('WDR');
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('ip66') || lower.includes('ip67')) features.push('IP66/67');
    if (lower.includes('ik10')) features.push('IK10');
    return features;
  }
}
