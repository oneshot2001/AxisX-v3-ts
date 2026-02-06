/**
 * Pelco product scraper
 * Target: pelco.com/cameras
 * Method: cheerio
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class PelcoScraper extends BaseScraper {
  constructor() {
    super({
      name: 'pelco',
      manufacturer: 'Pelco',
      baseUrl: 'https://www.pelco.com/',
      rateLimit: 6,
      method: 'cheerio',
      timeout: 15000,
      retries: 3,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    const categoryUrls = [
      'cameras/fixed-ip-cameras',
      'cameras/ptz-cameras',
      'cameras/panoramic-cameras',
    ];

    for (const category of categoryUrls) {
      try {
        const url = this.config.baseUrl + category;
        const html = await this.fetch(url);
        const $ = this.parseHtml(html);

        $('[class*="product"], .card, [class*="item"]').each((_i: number, el: any) => {
          const $el = $(el);
          const model = $el.find('[class*="model"], [class*="title"], h3, h4').first().text().trim();
          const description = $el.find('[class*="desc"], p').first().text().trim();
          const link = $el.find('a').first().attr('href') ?? '';

          if (!model) return;

          products.push({
            model,
            manufacturer: 'Pelco',
            type: this.normalizeType(this.inferType(model, description)),
            resolution: this.normalizeResolution(this.inferResolution(description)),
            features: this.extractFeatures(description),
            url: link.startsWith('http') ? link : `${this.config.baseUrl}${link}`,
          });
        });
      } catch {
        // Non-fatal
      }
    }

    return products;
  }

  private inferType(model: string, desc: string): string {
    const combined = `${model} ${desc}`.toLowerCase();
    if (combined.includes('ptz') || combined.includes('spectra')) return 'PTZ';
    if (combined.includes('bullet') || combined.includes('sarix')) return 'Bullet';
    if (combined.includes('dome') || combined.includes('optera')) return 'Dome';
    if (combined.includes('panoramic') || combined.includes('evolution')) return 'Panoramic';
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
    if (lower.includes('analytics')) features.push('Analytics');
    if (lower.includes('wdr')) features.push('WDR');
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('ip66') || lower.includes('ip67')) features.push('IP66/67');
    return features;
  }
}
