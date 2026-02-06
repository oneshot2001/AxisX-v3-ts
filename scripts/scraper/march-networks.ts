/**
 * March Networks product scraper
 * Target: marchnetworks.com
 * Method: cheerio
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class MarchNetworksScraper extends BaseScraper {
  constructor() {
    super({
      name: 'march-networks',
      manufacturer: 'March Networks',
      baseUrl: 'https://www.marchnetworks.com/',
      rateLimit: 6,
      method: 'cheerio',
      timeout: 15000,
      retries: 3,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    try {
      const url = this.config.baseUrl + 'products/cameras/';
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
          manufacturer: 'March Networks',
          type: this.normalizeType(this.inferType(model, description)),
          resolution: this.normalizeResolution(this.inferResolution(description)),
          features: this.extractFeatures(description),
          url: link.startsWith('http') ? link : `${this.config.baseUrl}${link}`,
        });
      });
    } catch {
      // Non-fatal
    }

    return products;
  }

  private inferType(_model: string, desc: string): string {
    const lower = desc.toLowerCase();
    if (lower.includes('ptz')) return 'PTZ';
    if (lower.includes('bullet')) return 'Bullet';
    if (lower.includes('dome')) return 'Dome';
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
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('wdr')) features.push('WDR');
    return features;
  }
}
