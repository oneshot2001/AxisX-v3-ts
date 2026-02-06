/**
 * i-PRO product scraper
 * Target: i-pro.com/products
 * Method: cheerio
 */

import { BaseScraper } from './base.js';
import type { ScrapedProduct } from './types.js';

export class IProScraper extends BaseScraper {
  constructor() {
    super({
      name: 'ipro',
      manufacturer: 'i-PRO',
      baseUrl: 'https://www.i-pro.com/products_and_solutions/en/',
      rateLimit: 6,
      method: 'cheerio',
      timeout: 15000,
      retries: 3,
    });
  }

  async scrape(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    const categoryUrls = [
      'surveillance/camera/network-camera',
      'surveillance/camera/ptz-camera',
      'surveillance/camera/multi-sensor-camera',
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

          if (!model || !model.match(/^(WV-|WV )/i)) return;

          products.push({
            model,
            manufacturer: 'i-PRO',
            type: this.normalizeType(this.inferType(model, description)),
            resolution: this.normalizeResolution(this.inferResolution(description)),
            features: this.extractFeatures(description),
            url: link.startsWith('http') ? link : `https://www.i-pro.com${link}`,
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
    if (combined.includes('ptz')) return 'PTZ';
    if (combined.includes('bullet')) return 'Bullet';
    if (combined.includes('dome')) return 'Dome';
    if (combined.includes('multi-sensor')) return 'Panoramic';
    if (combined.includes('box')) return 'Box';
    return 'Camera';
  }

  private inferResolution(desc: string): string {
    const lower = desc.toLowerCase();
    if (lower.includes('8mp') || lower.includes('4k')) return '4K';
    if (lower.includes('6mp')) return '6MP';
    if (lower.includes('5mp')) return '5MP';
    if (lower.includes('4mp')) return '4MP';
    if (lower.includes('2mp') || lower.includes('1080p')) return '1080p';
    return '1080p';
  }

  private extractFeatures(desc: string): string[] {
    const features: string[] = [];
    const lower = desc.toLowerCase();
    if (lower.includes('ai')) features.push('AI');
    if (lower.includes('wdr')) features.push('WDR');
    if (lower.includes('ir')) features.push('IR');
    if (lower.includes('ip66') || lower.includes('ip67')) features.push('IP66/67');
    if (lower.includes('ik10')) features.push('IK10');
    return features;
  }
}
